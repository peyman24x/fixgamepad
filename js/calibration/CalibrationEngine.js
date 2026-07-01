import { eventBus } from '../core/EventBus.js';
import { stateManager } from '../core/StateManager.js';
import { hidEngine } from '../hid/HIDEngine.js';
import { CalibVisualizer } from '../render/CalibVisualizer.js';

class CalibrationEngine {
    constructor() {
        this.activeController = null; 
        this.centerData = null;
        this.rangeData = null;
        this.restingFrames = []; 
        this.sweepBounds = {};
        this.visualizer = null;
        this.bindEvents();
    }

    bindEvents() {
        eventBus.on('device:connected', () => { this.resetCenter(); this.resetRange(); });
        eventBus.on('parser:controllerReady', (controller) => this.activeController = controller);
        document.addEventListener('state:render', (e) => this.handleStateUpdate(e.detail));
    }

    handleStateUpdate(inputState) {
        if (this.centerData === 'running') {
            this.restingFrames.push(inputState.axes);
            if (this.restingFrames.length >= 60) {
                let sumLX = 0, sumLY = 0, sumRX = 0, sumRY = 0;
                this.restingFrames.forEach(f => { sumLX += f.lx; sumLY += f.ly; sumRX += f.rx; sumRY += f.ry; });
                
                this.centerData = {
                    left: { x: sumLX / 60, y: sumLY / 60 },
                    right: { x: sumRX / 60, y: sumRY / 60 }
                };
                eventBus.emit('calib:centerState', 'write');
                eventBus.emit('log', { type: 'success', message: 'Center captured successfully.' });
            }
        }
        
        if (this.rangeData === 'running') {
            const lx = inputState.axes.lx, ly = inputState.axes.ly;
            const rx = inputState.axes.rx, ry = inputState.axes.ry;
            
            this.sweepBounds.left.maxX = Math.max(this.sweepBounds.left.maxX, lx);
            this.sweepBounds.left.minX = Math.min(this.sweepBounds.left.minX, lx);
            this.sweepBounds.left.maxY = Math.max(this.sweepBounds.left.maxY, ly);
            this.sweepBounds.left.minY = Math.min(this.sweepBounds.left.minY, ly);
            
            this.sweepBounds.right.maxX = Math.max(this.sweepBounds.right.maxX, rx);
            this.sweepBounds.right.minX = Math.min(this.sweepBounds.right.minX, rx);
            this.sweepBounds.right.maxY = Math.max(this.sweepBounds.right.maxY, ry);
            this.sweepBounds.right.minY = Math.min(this.sweepBounds.right.minY, ry);
            
            const th = 0.9;
            const lScore = (this.sweepBounds.left.maxX >= th ? 1 : 0) + 
                           (this.sweepBounds.left.minX <= -th ? 1 : 0) +
                           (this.sweepBounds.left.maxY >= th ? 1 : 0) +
                           (this.sweepBounds.left.minY <= -th ? 1 : 0);
                           
            const rScore = (this.sweepBounds.right.maxX >= th ? 1 : 0) + 
                           (this.sweepBounds.right.minX <= -th ? 1 : 0) +
                           (this.sweepBounds.right.maxY >= th ? 1 : 0) +
                           (this.sweepBounds.right.minY <= -th ? 1 : 0);
                           
            const progress = ((lScore + rScore) / 8) * 100;
            eventBus.emit('calibration:progress', progress);
            
            if (this.visualizer) {
                this.visualizer.draw({ left: {x: lx, y: ly, bounds: this.sweepBounds.left}, right: {x: rx, y: ry, bounds: this.sweepBounds.right} });
            }
            
            if (progress >= 100) {
                this.rangeData = JSON.parse(JSON.stringify(this.sweepBounds));
                eventBus.emit('calib:rangeState', 'write');
                eventBus.emit('log', { type: 'success', message: 'Range captured successfully.' });
            }
        }
    }

    startCenter() {
        if (!this.activeController) return;
        this.restingFrames = [];
        this.centerData = 'running';
        eventBus.emit('calib:centerState', 'running');
        eventBus.emit('log', { type: 'info', message: 'Center Calibration started. Do not touch sticks.' });
    }

    async writeCenter() {
        if (!this.activeController || typeof this.centerData !== 'object') return;
        eventBus.emit('log', { type: 'warning', message: 'Writing Center to Flash...' });
        try {
            const success = await this.activeController.writeCalibrationData(hidEngine, { type: 'center', data: this.centerData });
            if (success) eventBus.emit('log', { type: 'success', message: 'Center written to device!' });
            else throw new Error("OS Blocked");
            this.resetCenter();
        } catch (e) { eventBus.emit('log', { type: 'error', message: e.message }); this.resetCenter(); }
    }

    resetCenter() {
        this.centerData = null;
        eventBus.emit('calib:centerState', 'idle');
    }

    startRange() {
        if (!this.activeController) return;
        this.sweepBounds = { left: {minX:0,maxX:0,minY:0,maxY:0}, right: {minX:0,maxX:0,minY:0,maxY:0} };
        this.rangeData = 'running';
        this.visualizer = new CalibVisualizer();
        eventBus.emit('calib:rangeState', 'running');
        eventBus.emit('calibration:progress', 0);
        eventBus.emit('log', { type: 'info', message: 'Range Calibration started. Rotate sticks.' });
    }

    async writeRange() {
        if (!this.activeController || typeof this.rangeData !== 'object') return;
        eventBus.emit('log', { type: 'warning', message: 'Writing Range to Flash...' });
        try {
            const success = await this.activeController.writeCalibrationData(hidEngine, { type: 'range', data: this.rangeData });
            if (success) eventBus.emit('log', { type: 'success', message: 'Range written to device!' });
            else throw new Error("OS Blocked");
            this.resetRange();
        } catch (e) { eventBus.emit('log', { type: 'error', message: e.message }); this.resetRange(); }
    }

    resetRange() {
        this.rangeData = null;
        this.visualizer = null;
        eventBus.emit('calib:rangeState', 'idle');
    }
}

export const calibrationEngine = new CalibrationEngine();