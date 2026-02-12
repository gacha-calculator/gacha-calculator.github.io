use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn handle_sr_pulls(input: f64) -> f64 {
    input * 2.0 
}