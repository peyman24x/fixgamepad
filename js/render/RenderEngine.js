import { stateManager } from '../core/StateManager.js';
class RenderEngine {
    constructor() { this.rafId = null; this.isRunning = false; }
    start() { if (this.isRunning) return; this.isRunning = true; this.loop(); }
    stop() { if (!this.isRunning) return; cancelAnimationFrame(this.rafId); this.isRunning = false; }
    loop() {
        if (!this.isRunning) return;
        const currentState = stateManager.getInputState();
        document.dispatchEvent(new CustomEvent('state:render', { detail: currentState }));
        this.rafId = requestAnimationFrame(() => this.loop());
    }
}
export const renderEngine = new RenderEngine();