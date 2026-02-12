use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Copy)]
pub enum LayerType {
    Character,
    Target,
    DoubleTarget,
}

#[derive(Debug)]
pub struct DistributionLayer {
    pub probabilities: Vec<f64>,
    pub layer_type: LayerType,
    pub banner_count: u32,
    pub min_index: usize,
    pub max_index: usize,
}

impl DistributionLayer {
    fn new(size: usize, layer_type: LayerType, banner_count: u32) -> Self {
        Self {
            probabilities: vec![0.0; size],
            layer_type,
            banner_count,
            min_index: 0,
            max_index: 0,
        }
    }
}

use crate::endfield::ssr::{PullPlanStep, Pity, StatesLimits};

pub fn make_distribution_arrays_ssr(
    pull_plan: &Vec<PullPlanStep>,
    pity: &Pity,
    limits: &StatesLimits,
) -> Result<Vec<DistributionLayer>, JsError> {
    let PITY_CONST: usize = limits.CHARACTER as usize;
    const SPARKS: usize = 360;
    const KEYS: usize = 45;
    let BUFFER_SIZE: usize = SPARKS * PITY_CONST * KEYS;

    let mut layers = Vec::with_capacity(pull_plan.len() + 2);

    for plan in pull_plan {
        layers.push(DistributionLayer::new(
            BUFFER_SIZE,
            LayerType::Character,
            plan.banner_count,
        ));
    }

    layers.push(DistributionLayer::new(
        BUFFER_SIZE,
        LayerType::Target,
        0,
    ));

    layers.push(DistributionLayer::new(
        BUFFER_SIZE,
        LayerType::DoubleTarget,
        0,
    ));

    if let Some(first_layer) = layers.first_mut() {
        let starting_pity = pity.char as usize;
        if starting_pity < first_layer.probabilities.len() {
            first_layer.probabilities[starting_pity] = 1.0;
        } else {
            return Err(JsError::new("Starting pity exceeds buffer size"));
        }
    }

    Ok(layers)
}