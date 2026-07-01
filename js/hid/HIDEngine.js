import { eventBus } from '../core/EventBus.js';
import { stateManager } from '../core/StateManager.js';
class HIDEngine {
    constructor() {
        this.device = null;
        this.pollingRate = 0;
        this.inputCount = 0;
        this.rateInterval = null;
        
        this.handleInputReport = this.handleInputReport.bind(this);
        this.handleDisconnect = this.handleDisconnect.bind(this);
        eventBus.on('hid:getEngine', (callback) => callback(this));
    }
    isSupported() { return 'hid' in navigator; }
    async requestConnection() {
        if (!this.isSupported()) { alert('WebHID not supported.'); return; }
        stateManager.setConnectionStatus('connecting');
        try {
            const filters = [
                { vendorId: 0x054C, productId: 0x09CC }, { vendorId: 0x054C, productId: 0x05C4 },
                { vendorId: 0x054C, productId: 0x0CE6 },
                { vendorId: 0x045E, productId: 0x02FD }, { vendorId: 0x045E, productId: 0x0B00 }
            ];
            const devices = await navigator.hid.requestDevice({ filters });
            if (devices.length === 0) { stateManager.setConnectionStatus('disconnected'); return; }
            await this.connect(devices[0]);
        } catch (error) { stateManager.setConnectionStatus('error'); }
    }
    async connect(device) {
        this.device = device;
        if (!this.device.opened) await this.device.open();
        
        // FIX: Remove the bad heuristic. Default to USB, as it's the most reliable for calibration.
        const connectionType = 'USB';
        
        const deviceInfo = {
            name: this.device.productName || 'Unknown Controller',
            vendorId: this.device.vendorId, productId: this.device.productId, connectionType
        };
        stateManager.setConnectionStatus('connected', deviceInfo);
        eventBus.emit('log', { type: 'success', message: `Connected to ${deviceInfo.name}` });
        
        this.device.addEventListener('inputreport', this.handleInputReport);
        navigator.hid.addEventListener('disconnect', this.handleDisconnect);
        
        this.rateInterval = setInterval(() => {
            this.pollingRate = this.inputCount;
            this.inputCount = 0;
            eventBus.emit('ui:updatePollingRate', this.pollingRate);
        }, 1000);

        eventBus.emit('device:connected', deviceInfo);
    }
    async disconnect() {
        if (!this.device) return;
        if (this.rateInterval) clearInterval(this.rateInterval);
        this.device.removeEventListener('inputreport', this.handleInputReport);
        navigator.hid.removeEventListener('disconnect', this.handleDisconnect);
        try { await this.device.close(); } catch (e) {}
        this.device = null;
        stateManager.setConnectionStatus('disconnected');
        eventBus.emit('device:disconnected');
    }
    handleDisconnect(event) {
        if (this.device && event.device === this.device) this.disconnect();
    }
    handleInputReport(event) {
        this.inputCount++;
        eventBus.emit('hid:rawInput', { reportId: event.reportId, data: event.data });
    }
    
    async sendFeatureReport(reportId, data) {
        if (!this.device) return false;
        try {
            await this.device.sendFeatureReport(reportId, data);
            eventBus.emit('log', { type: 'success', message: `Feature Report 0x${reportId.toString(16)} sent successfully.` });
            return true;
        } catch (e) {
            eventBus.emit('log', { type: 'info', message: `Standard write failed, trying Windows buffer workaround...` });
            try {
                const winPayload = new Uint8Array(data.length + 1);
                winPayload[0] = reportId;
                winPayload.set(data, 1);
                await this.device.sendFeatureReport(reportId, winPayload);
                eventBus.emit('log', { type: 'success', message: `Feature Report 0x${reportId.toString(16)} sent via Windows workaround.` });
                return true;
            } catch (e2) {
                eventBus.emit('log', { type: 'error', message: `OS Security Block: ${e2.message}` });
                return false;
            }
        }
    }
    
    async readFeatureReport(reportId) {
        if (!this.device) return null;
        try { return await this.device.receiveFeatureReport(reportId); } catch (e) { return null; }
    }
}
export const hidEngine = new HIDEngine();