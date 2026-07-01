import { eventBus } from '../core/EventBus.js';
import { stateManager } from '../core/StateManager.js';
import { DualShock4 } from './DualShock4.js';
import { DualSense } from './DualSense.js';
class ReportParser {
    constructor() { this.activeController = null; this.bindEvents(); }
    bindEvents() {
        eventBus.on('device:connected', (info) => this.initController(info));
        eventBus.on('device:disconnected', () => this.activeController = null);
        eventBus.on('hid:rawInput', ({ reportId, data }) => this.routeInput(reportId, data));
    }
    async initController(deviceInfo) {
        const { vendorId, productId } = deviceInfo;
        if (vendorId === 0x054C && (productId === 0x09CC || productId === 0x05C4)) this.activeController = new DualShock4(deviceInfo);
        else if (vendorId === 0x054C && productId === 0x0CE6) this.activeController = new DualSense(deviceInfo);
        else { eventBus.emit('log', { type: 'warning', message: 'Unsupported controller.' }); return; }
        
        eventBus.emit('parser:controllerReady', this.activeController);
        eventBus.emit('ui:updateDeviceInfo', this.activeController.deviceInfo);
        
        eventBus.emit('hid:getEngine', async (engine) => {
            const hwInfo = await this.activeController.fetchHardwareInfo(engine);
            if (hwInfo) eventBus.emit('ui:updateHardwareInfo', hwInfo);
        });
    }
    routeInput(reportId, data) {
        if (!this.activeController) return;
        try {
            const parsedState = this.activeController.parseInputReport(reportId, data);
            if (parsedState) stateManager.updateInputState(parsedState);
        } catch (error) { console.error(error); }
    }
}
export const reportParser = new ReportParser();