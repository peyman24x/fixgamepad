import { eventBus } from './EventBus.js';
class StateManager {
    constructor() {
        this.state = {
            connectionStatus: 'disconnected', deviceInfo: { name: 'Unknown', vendorId: 0, productId: 0, connectionType: 'USB' },
            inputState: {
                buttons: {}, axes: { lx: 0, ly: 0, rx: 0, ry: 0 },
                triggers: { l2: 0, r2: 0 }, battery: { level: 0, charging: false }
            }
        };
    }
    setConnectionStatus(status, deviceInfo = null) {
        this.state.connectionStatus = status;
        if (status === 'connected' && deviceInfo) this.state.deviceInfo = deviceInfo;
        else if (status === 'disconnected') this.resetInputState();
        eventBus.emit('connection:statusChanged', status);
    }
    updateInputState(newInputState) {
        Object.assign(this.state.inputState.buttons, newInputState.buttons || {});
        Object.assign(this.state.inputState.axes, newInputState.axes || {});
        Object.assign(this.state.inputState.triggers, newInputState.triggers || {});
        if (newInputState.battery) Object.assign(this.state.inputState.battery, newInputState.battery);
    }
    getInputState() { return this.state.inputState; }
    resetInputState() {
        this.state.inputState = {
            buttons: {}, axes: { lx: 0, ly: 0, rx: 0, ry: 0 },
            triggers: { l2: 0, r2: 0 }, battery: { level: 0, charging: false }
        };
    }
}
export const stateManager = new StateManager();