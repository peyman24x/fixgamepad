import { eventBus } from '../core/EventBus.js';
import { calibrationEngine } from '../calibration/CalibrationEngine.js';

class UIManager {
    constructor() { 
        this.cacheDOM(); 
        this.bindEvents(); 
    }
    
    cacheDOM() {
        this.el = {
            deviceName: document.getElementById('device-name'), 
            connType: document.getElementById('connection-type'),
            batteryLevel: document.getElementById('battery-level'), 
            pollingRate: document.getElementById('polling-rate'),
            hardwareInfo: document.getElementById('hardware-info-grid'), 
            appContainer: document.getElementById('app-container'),
            reconnectModal: document.getElementById('reconnect-modal'), 
            btnReconnect: document.getElementById('btn-reconnect'),
            axesData: document.getElementById('axes-data'),
            triggersData: document.getElementById('triggers-data'),
            buttonsData: document.getElementById('buttons-data')
        };
    }
    
    bindEvents() {
        eventBus.on('ui:updateDeviceInfo', (info) => {
            this.el.deviceName.textContent = info.name;
            this.el.connType.textContent = info.connectionType;
        });
        eventBus.on('ui:updateHardwareInfo', (info) => {
            this.el.hardwareInfo.innerHTML = `
                <div class="info-row"><span>Firmware:</span><strong>${info.firmwareVersion || 'N/A'}</strong></div>
                <div class="info-row"><span>MAC Address:</span><strong>${info.macAddress || 'N/A'}</strong></div>
            `;
        });
        eventBus.on('ui:updatePollingRate', (hz) => this.el.pollingRate.textContent = `${hz} Hz`);
        
        eventBus.on('connection:statusChanged', (status) => {
            if (status === 'disconnected' || status === 'error') {
                this.el.appContainer.classList.add('blurred');
                this.el.reconnectModal?.classList.add('active');
            } else if (status === 'connected') {
                this.el.appContainer.classList.remove('blurred');
                this.el.reconnectModal?.classList.remove('active');
            }
        });
        
        document.addEventListener('state:render', (e) => this.updateRealtimeData(e.detail));
        this.el.btnReconnect?.addEventListener('click', () => eventBus.emit('hid:reconnectRequest'));
        
        // Center Calib Events
        document.getElementById('btn-start-center')?.addEventListener('click', () => calibrationEngine.startCenter());
        document.getElementById('btn-write-center')?.addEventListener('click', () => calibrationEngine.writeCenter());
        document.getElementById('btn-cancel-center')?.addEventListener('click', () => calibrationEngine.resetCenter());
        
        // Range Calib Events
        document.getElementById('btn-start-range')?.addEventListener('click', () => calibrationEngine.startRange());
        document.getElementById('btn-write-range')?.addEventListener('click', () => calibrationEngine.writeRange());
        document.getElementById('btn-cancel-range')?.addEventListener('click', () => calibrationEngine.resetRange());
        
        eventBus.on('calib:centerState', (state) => this.toggleCenterUI(state));
        eventBus.on('calib:rangeState', (state) => this.toggleRangeUI(state));
        
        eventBus.on('calibration:progress', (p) => {
            const bar = document.getElementById('sweep-progress-bar');
            if (bar) bar.style.width = `${p}%`;
        });
    }
    
    toggleCenterUI(state) {
        document.getElementById('center-calib-idle').style.display = state === 'idle' ? 'block' : 'none';
        document.getElementById('center-calib-running').style.display = state === 'running' ? 'block' : 'none';
        document.getElementById('center-calib-write').style.display = state === 'write' ? 'block' : 'none';
    }
    
    toggleRangeUI(state) {
        document.getElementById('range-calib-idle').style.display = state === 'idle' ? 'block' : 'none';
        document.getElementById('range-calib-running').style.display = state === 'running' ? 'block' : 'none';
        document.getElementById('range-calib-write').style.display = state === 'write' ? 'block' : 'none';
    }

    updateRealtimeData(state) {
        this.el.batteryLevel.textContent = `${state.battery.level}%`;
        this.el.axesData.innerHTML = `
            <span>LX: ${state.axes.lx.toFixed(2)}</span>
            <span>LY: ${state.axes.ly.toFixed(2)}</span>
            <span>RX: ${state.axes.rx.toFixed(2)}</span>
            <span>RY: ${state.axes.ry.toFixed(2)}</span>
        `;
        this.el.triggersData.innerHTML = `
            <span>L2: ${(state.triggers.l2 * 100).toFixed(0)}%</span>
            <span>R2: ${(state.triggers.r2 * 100).toFixed(0)}%</span>
        `;
        const pressed = Object.keys(state.buttons).filter(b => state.buttons[b]);
        this.el.buttonsData.innerHTML = pressed.length > 0 
            ? pressed.join(', ') 
            : '<span class="muted">No buttons pressed</span>';
    }
}

export const uiManager = new UIManager();