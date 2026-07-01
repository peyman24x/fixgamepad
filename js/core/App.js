import { eventBus } from './EventBus.js';
import { stateManager } from './StateManager.js';
import { hidEngine } from '../hid/HIDEngine.js';
import '../controllers/ReportParser.js';
import '../ui/UIManager.js';
import { renderEngine } from '../render/RenderEngine.js';
import '../ui/Terminal.js';
import '../render/ControllerVisualizer.js';
import { initStickCanvases } from '../render/StickCanvas.js';
import { calibrationEngine } from '../calibration/CalibrationEngine.js';

class App {
    constructor() {
        this.initUI();
        this.bindEvents();
        initStickCanvases();
    }
    initUI() {
        this.btnConnect = document.getElementById('btn-connect');
        this.statusBadge = document.getElementById('connection-status');
    }
    bindEvents() {
        this.btnConnect.addEventListener('click', () => this.handleConnectClick());
        eventBus.on('connection:statusChanged', (status) => this.updateConnectionUI(status));
        eventBus.on('hid:reconnectRequest', () => this.handleConnectClick());
        eventBus.on('calibration:finishSweep', () => calibrationEngine.finishSweep());
        eventBus.on('calibration:writeToFlash', () => calibrationEngine.writeToFlash());
        eventBus.on('calibration:reset', () => calibrationEngine.reset());
    }
    async handleConnectClick() {
        if (stateManager.state.connectionStatus === 'connected') {
            await hidEngine.disconnect();
            renderEngine.stop();
        } else {
            await hidEngine.requestConnection();
        }
    }
    updateConnectionUI(status) {
        this.statusBadge.className = `status-badge ${status}`;
        const statusText = { 'disconnected': 'Disconnected', 'connecting': 'Connecting...', 'connected': 'Connected', 'error': 'Error' };
        this.statusBadge.textContent = statusText[status] || 'Unknown';
        if (status === 'connected') {
            this.btnConnect.textContent = 'Disconnect';
            renderEngine.start();
        } else {
            this.btnConnect.textContent = 'Connect Controller';
            renderEngine.stop();
        }
    }
}
document.addEventListener('DOMContentLoaded', () => new App());