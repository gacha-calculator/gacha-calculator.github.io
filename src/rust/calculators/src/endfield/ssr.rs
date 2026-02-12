use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use js_sys::Float64Array;
use crate::endfield::make_distribution::{make_distribution_arrays_ssr, DistributionLayer};

// --- CONSTANTS ---
const PRUNE_LEVEL: f64 = 1e-10;
const SPARKS: usize = 360;
const SPARKS_PAST_GUARANTEE: usize = 120;
const PITY_STATES: usize = 80;
const STATES_PER_KEY: usize = PITY_STATES * SPARKS;
const ITERATION: usize = STATES_PER_KEY + 361;

// --- STRUCTS ---
#[derive(Deserialize, Serialize, Clone)]
pub struct PullPlanStep {
    #[serde(rename = "type")]
    pub pull_type: String,
    #[serde(rename = "bannerCount")]
    pub banner_count: u32,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Pity {
    pub char: u32,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct StatesLimits {
    pub CHARACTER: u32,
    pub SR: u32,
    pub WEAPON: u32,
}

pub struct BoundsIndices {
    pub min_item: usize,
    pub max_item: usize,
}

#[wasm_bindgen]
pub struct PullResult {
    #[wasm_bindgen(getter_with_clone)]
    pub chartData: JsValue,
    #[wasm_bindgen(getter_with_clone)]
    pub distributionSSRFinal: JsValue,
}

#[wasm_bindgen]
pub struct HandleSsrPulls {
    layers: Vec<DistributionLayer>,
    odds: Vec<f64>,
}

// --- IMPLEMENTATION ---
#[wasm_bindgen]
impl HandleSsrPulls {
    #[wasm_bindgen(constructor)]
    pub fn new(js_pull_plan: JsValue, js_pity: JsValue, js_limits: JsValue, odds: Vec<f64>) -> Result<HandleSsrPulls, JsError> {
        let pull_plan: Vec<PullPlanStep> = serde_wasm_bindgen::from_value(js_pull_plan)
            .map_err(|e| JsError::new(&format!("PullPlan Error: {}", e)))?;
        let pity: Pity = serde_wasm_bindgen::from_value(js_pity)
            .map_err(|e| JsError::new(&format!("Pity Error: {}", e)))?;
        let limits: StatesLimits = serde_wasm_bindgen::from_value(js_limits)
            .map_err(|e| JsError::new(&format!("Limits Error: {}", e)))?;

        let layers = make_distribution_arrays_ssr(&pull_plan, &pity, &limits)
            .map_err(|e| JsError::new(&format!("{:?}", e)))?;

        Ok(HandleSsrPulls { layers, odds })
    }

    pub fn run_pulls(&mut self) -> Result<Float64Array, JsError> {
        let mut bounds_indices = BoundsIndices { min_item: 0, max_item: 0 };
        let snapshot_interval = 20;
        let expected_rows = 800 / snapshot_interval;
        let mut flat_results = Vec::with_capacity(expected_rows * self.layers.len());

        for current_pull in 0..800 {
            process_pull_ssr(&self.odds, &mut self.layers, &mut bounds_indices);

            if current_pull % snapshot_interval == 0 {
                for (i, layer) in self.layers.iter().enumerate() {
                    let mut sum = 0.0;
                    let is_last_two = i >= self.layers.len() - 2;

                    if is_last_two {
                        sum = layer.probabilities.iter().sum();
                    } else if layer.max_index >= layer.min_index && layer.max_index < layer.probabilities.len() {
                        sum = layer.probabilities[layer.min_index..=layer.max_index].iter().sum();
                    }
                    flat_results.push(sum);
                }
            }
        }

        Ok(Float64Array::from(&flat_results[..]))
    }
}

fn process_pull_ssr(
    odds: &[f64],
    layers: &mut [DistributionLayer],
    bounds_indices: &mut BoundsIndices
) {
    let dist_len = layers.len();
    let max_active = bounds_indices.max_item;
    let min_active = bounds_indices.min_item;
    let mut normalize_sum = 0.0;
    
    for wins in (min_active..=max_active).rev() {
        let (left, right) = layers.split_at_mut(wins + 1);
        let current = &mut left[wins];
        let (next, double_next) = {
            let (n, dn) = right.split_at_mut(1);
            (&mut n[0], &mut dn[0])
        };

        process_pull_in_char_item(odds, current, next, double_next, &mut normalize_sum);
    }

    find_bounds(layers, bounds_indices, &mut normalize_sum);
}

#[inline(always)]
fn process_pull_in_char_item(
    odds: &[f64],
    current: &mut DistributionLayer,
    next: &mut DistributionLayer,
    mut double_next: &mut DistributionLayer,
    normalize_sum: &mut f64,
) {
    let are_next_new = next.banner_count != current.banner_count;
    let are_dn_new = double_next.banner_count != current.banner_count;
    let starting_index = current.max_index;
    let final_index = current.min_index;

    let curr_probs = &mut current.probabilities;
    let next_probs = &mut next.probabilities;
    let dn_probs = &mut double_next.probabilities;

    let within_key = starting_index % STATES_PER_KEY;
    let mut key_index = starting_index - within_key;
    let mut pity = within_key / SPARKS;
    let mut spark = within_key % SPARKS;
    let mut pity_index = within_key - spark;

    let mut win_odds = odds[pity] * 0.5;
    let mut loss_odds = 1.0 - odds[pity];

    let final_spark_chunk = (((final_index / SPARKS) + 1) * SPARKS) - 1;
    let starting_pity_bind = starting_index - spark;
    let final_pity_bind = final_index + final_spark_chunk;
    let have_pity_chunk = starting_pity_bind != final_pity_bind;

    if are_next_new {
        for i in (final_index..=starting_index).rev() {
            let prob = curr_probs[i];
            if prob < PRUNE_LEVEL {
                if prob > 0.0 { *normalize_sum += prob; }
                curr_probs[i] = 0.0;
            } else {
                if spark < 120 {
                    if spark == 119 { next_probs[key_index] += prob; }
                    else {
                        let p_win = prob * win_odds;
                        next_probs[key_index] += p_win;
                        curr_probs[i + STATES_PER_KEY - pity_index + 1] += p_win;
                        curr_probs[i + 361] += prob * loss_odds;
                    }
                } else {
                    let p_win = prob * win_odds;
                    let p_fail = prob * loss_odds;
                    if spark == 359 {
                        dn_probs[key_index] += p_win;
                        next_probs[key_index + STATES_PER_KEY] += p_win;
                        next_probs[key_index + pity_index + SPARKS] += p_fail;
                    } else {
                        next_probs[key_index] += p_win;
                        curr_probs[i + STATES_PER_KEY - pity_index + 1] += p_win;
                        curr_probs[i + 361] += p_fail;
                    }
                }
                curr_probs[i] = 0.0;
            }

            if spark == 0 {
                spark = SPARKS - 1;
                if pity == 0 {
                    pity = PITY_STATES - 1;
                    pity_index = (PITY_STATES - 1) * SPARKS;
                    key_index = key_index.saturating_sub(STATES_PER_KEY);
                } else {
                    pity -= 1;
                    pity_index -= SPARKS;
                }
                win_odds = odds[pity] * 0.5;
                loss_odds = 1.0 - odds[pity];
            } else { spark -= 1; }
        }
    } else {
        let mut i = starting_index;
        while i >= final_index && spark != 0 {
            let prob = curr_probs[i];
            if prob < PRUNE_LEVEL {
                if prob > 0.0 { *normalize_sum += prob; }
                curr_probs[i] = 0.0;
            } else {
                if spark < 120 {
                    if spark == 119 {
                        next_probs[key_index + spark + SPARKS_PAST_GUARANTEE + 1] += prob;
                    } else {
                        let p_win = prob * win_odds;
                        let p_fail = prob * loss_odds;
                        next_probs[key_index + spark + SPARKS_PAST_GUARANTEE + 1] += p_win;
                        curr_probs[i + STATES_PER_KEY - pity_index + 1] += p_win;
                        curr_probs[i + 361] += p_fail;
                    }
                } else {
                    let p_win = prob * win_odds;
                    let p_fail = prob * loss_odds;
                    if spark == 359 {
                        let idx = if are_dn_new { key_index } else { key_index + SPARKS_PAST_GUARANTEE };
                        dn_probs[idx] += p_win;
                        next_probs[key_index + STATES_PER_KEY + SPARKS_PAST_GUARANTEE] += p_win;
                        next_probs[key_index + pity_index + SPARKS + SPARKS_PAST_GUARANTEE] += p_fail;
                    } else {
                        next_probs[key_index + spark + 1] += p_win;
                        curr_probs[i + STATES_PER_KEY - pity_index + 1] += p_win;
                        curr_probs[i + 361] += p_fail;
                    }
                }
                curr_probs[i] = 0.0;
            }
            spark -= 1;
            i -= 1; 
        }

        while i >= final_index + SPARKS { // better con, not just + sparks but a spark breakpoint can precalc
            spark = SPARKS - 1;
            if pity == 0 {
                pity = PITY_STATES - 1;
                pity_index = (PITY_STATES - 1) * SPARKS;
                key_index = key_index.saturating_sub(STATES_PER_KEY);
            } else {
                pity -= 1;
                pity_index -= SPARKS;
            }
            win_odds = odds[pity] * 0.5;
            loss_odds = 1.0 - odds[pity];
        
            {
                let curr_idx = i;
                let prob = curr_probs[curr_idx];
                let idx = if are_dn_new { key_index } else { key_index + SPARKS_PAST_GUARANTEE };
                dn_probs[idx] += p_win;
                next_probs[key_index + STATES_PER_KEY + SPARKS_PAST_GUARANTEE] += p_win;
                next_probs[key_index + pity_index + SPARKS + SPARKS_PAST_GUARANTEE] += p_fail;
            }

            for s in (120..359).rev() { 
                let curr_idx = i;
                let prob = curr_probs[curr_idx];

                next_probs[key_index + spark + 1] += p_win;
                curr_probs[i + STATES_PER_KEY - pity_index + 1] += p_win;
                curr_probs[i + 361] += p_fail;

                i -= 1;
                spark -= 1; 
            }
        
            {
                next_probs[key_index + spark + SPARKS_PAST_GUARANTEE + 1] += prob;
                i -= 1;
                spark -= 1;
            }
        
            for s in (0..119).rev() {
                let curr_idx = i;
                let prob = curr_probs[curr_idx];
                let p_win = prob * win_odds;
                let p_fail = prob * loss_odds;
                next_probs[key_index + spark + SPARKS_PAST_GUARANTEE + 1] += p_win;
                curr_probs[i + STATES_PER_KEY - pity_index + 1] += p_win;
                curr_probs[i + 361] += p_fail;

                i -= 1;
                spark -= 1;
            }
            spark = 0; 
        }

        spark = SPARKS - 1;
        if pity == 0 {
            pity = PITY_STATES - 1;
            pity_index = (PITY_STATES - 1) * SPARKS;
            key_index = key_index.saturating_sub(STATES_PER_KEY);
        } else {
            pity -= 1;
            pity_index -= SPARKS;
        }
    
        while i >= starting_index {
            let prob = curr_probs[i];
            if prob < PRUNE_LEVEL {
                if prob > 0.0 { *normalize_sum += prob; }
                curr_probs[i] = 0.0;
            } else {
                if spark < 120 {
                    if spark == 119 {
                        next_probs[key_index + spark + SPARKS_PAST_GUARANTEE + 1] += prob;
                    } else {
                        let p_win = prob * win_odds;
                        let p_fail = prob * loss_odds;
                        next_probs[key_index + spark + SPARKS_PAST_GUARANTEE + 1] += p_win;
                        curr_probs[i + STATES_PER_KEY - pity_index + 1] += p_win;
                        curr_probs[i + 361] += p_fail;
                    }
                } else {
                    let p_win = prob * win_odds;
                    let p_fail = prob * loss_odds;
                    if spark == 359 {
                        let idx = if are_dn_new { key_index } else { key_index + SPARKS_PAST_GUARANTEE };
                        dn_probs[idx] += p_win;
                        next_probs[key_index + STATES_PER_KEY + SPARKS_PAST_GUARANTEE] += p_win;
                        next_probs[key_index + pity_index + SPARKS + SPARKS_PAST_GUARANTEE] += p_fail;
                    } else {
                        next_probs[key_index + spark + 1] += p_win;
                        curr_probs[i + STATES_PER_KEY - pity_index + 1] += p_win;
                        curr_probs[i + 361] += p_fail;
                    }
                }
                curr_probs[i] = 0.0;
            }
            spark -= 1;
            i -= 1;
        }
    }
}

fn find_bounds(layers: &mut [DistributionLayer], bounds: &mut BoundsIndices, normalize_sum: &mut f64) -> bool {
    let len = layers.len();
    if bounds.max_item + 3 != len {
        if bounds.max_item + 4 == len {
            bounds.max_item += 1;
        } else {
            bounds.max_item += 2;
        }
    }
    let old_data: Vec<_> = layers.iter().map(|layer| layer.max_index).collect();
    let mut min_item_not_found = true;
    let mut sum_pruned = 0.0;

    for i in bounds.min_item..=bounds.max_item {
        let max_search = if i != 0 {
            let max_index_from_last = old_data[i - 1] + 1;
            let max_index_from_current = old_data[i] + ITERATION;
            max_index_from_last.max(max_index_from_current)
            } else {
                old_data[i] + ITERATION
        };
        
        let layer = &mut layers[i];

        if min_item_not_found {
            for j in layer.min_index..=max_search {
                if layer.probabilities[j] > PRUNE_LEVEL {
                    bounds.min_item = i;
                    layer.min_index = j;
                    min_item_not_found = false;
                    for k in (j..=max_search).rev() {
                        if layer.probabilities[k] > PRUNE_LEVEL {
                            layer.max_index = k;
                            break;
                        } else if layer.probabilities[k] > 0.0 {
                            sum_pruned += layer.probabilities[k];
                            layer.probabilities[k] = 0.0;
                        }
                    }
                    break;
                } else if layer.probabilities[j] > 0.0 {
                    sum_pruned += layer.probabilities[j];
                    layer.probabilities[j] = 0.0;
                }
            }
            if min_item_not_found {
                if i == len - 3 {
                    return true;
                } else {
                    layer.min_index = 0;
                    layer.max_index = 0;
                }
                layers[i + 1].min_index = 0;
                layers[i + 1].max_index = 0;
            }
        } else {
            for j in layer.min_index..=max_search {
                if layer.probabilities[j] > PRUNE_LEVEL {
                    layer.min_index = j;
                    for k in (j..=max_search).rev() {
                        if layer.probabilities[k] > PRUNE_LEVEL {
                            layer.max_index = k;
                            break;
                        } else if layer.probabilities[k] > 0.0 {
                            sum_pruned += layer.probabilities[k];
                            layer.probabilities[k] = 0.0;
                        }
                    }
                    break;
                } else if layer.probabilities[j] > 0.0 {
                    sum_pruned += layer.probabilities[j];
                    layer.probabilities[j] = 0.0;
                }
            }
        }

    }
    *normalize_sum += sum_pruned;
    return false;
}