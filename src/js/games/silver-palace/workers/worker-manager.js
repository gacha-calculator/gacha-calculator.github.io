import SSRAggregateWorker from './ssr-aggregate-worker.js?worker';
import SSRPerItemWorker from './ssr-per-item-worker.js?worker';
import SSRCheapWorker from './ssr-cheap-worker.js?worker';

export class WorkerManager {
    constructor() {
        this.ssrAggregateWorker = null;
        this.ssrPerItemWorker = null;
        this.ssrCheapWorker = null;
    }

    getWorkers() {
        if (!this.ssrAggregateWorker) {
            this.ssrAggregateWorker = new SSRAggregateWorker();
        }
        if (!this.ssrPerItemWorker) {
            this.ssrPerItemWorker = new SSRPerItemWorker();
        }
        if (!this.ssrCheapWorker) {
            this.ssrCheapWorker = new SSRCheapWorker();
        }
        return {
            ssrAggregateWorker: this.ssrAggregateWorker,
            ssrPerItemWorker: this.ssrPerItemWorker,
            ssrCheapWorker: this.ssrCheapWorker
        };
    }

    terminateWorkers() {
        if (this.ssrAggregateWorker) this.ssrAggregateWorker.terminate();
        if (this.ssrPerItemWorker) this.ssrPerItemWorker.terminate();
        if (this.ssrCheapWorker) this.ssrCheapWorker.terminate();

        this.ssrAggregateWorker = null;
        this.ssrPerItemWorker = null;
        this.ssrCheapWorker = null;
    }
}