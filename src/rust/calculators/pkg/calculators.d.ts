/* tslint:disable */
/* eslint-disable */

export class HandleSsrPulls {
    free(): void;
    [Symbol.dispose](): void;
    constructor(js_pull_plan: any, js_pity: any, js_limits: any, odds: Float64Array);
    run_pulls(): Float64Array;
}

export class PullResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    chartData: any;
    distributionSSRFinal: any;
}

export function handle_sr_pulls(input: number): number;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_get_pullresult_chartData: (a: number) => any;
    readonly __wbg_get_pullresult_distributionSSRFinal: (a: number) => any;
    readonly __wbg_handlessrpulls_free: (a: number, b: number) => void;
    readonly __wbg_pullresult_free: (a: number, b: number) => void;
    readonly __wbg_set_pullresult_chartData: (a: number, b: any) => void;
    readonly __wbg_set_pullresult_distributionSSRFinal: (a: number, b: any) => void;
    readonly handle_sr_pulls: (a: number) => number;
    readonly handlessrpulls_new: (a: any, b: any, c: any, d: number, e: number) => [number, number, number];
    readonly handlessrpulls_run_pulls: (a: number) => [number, number, number];
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
