import SSRWorker from './ssr-worker.js?worker';
import SRWorker from './sr-worker.js?worker';

export class WorkerManager {
    constructor() {
        this.ssrWorker = null;
        this.srWorker = null;
    }

    getWorkers() {
        if (!this.ssrWorker) {
            this.ssrWorker = new SSRWorker();
        }
        if (!this.srWorker) {
            this.srWorker = new SRWorker();
        }
        return {
            ssrWorker: this.ssrWorker,
            srWorker: this.srWorker
        };
    }

    terminateWorkers() {
        if (this.ssrWorker) this.ssrWorker.terminate();
        if (this.srWorker) this.srWorker.terminate();
        this.ssrWorker = null;
        this.srWorker = null;
    }
}