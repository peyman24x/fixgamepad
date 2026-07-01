import { BaseController } from './BaseController.js';
import { HexUtils } from '../utils/HexUtils.js';

export class DualSense extends BaseController {
    constructor(deviceInfo) { 
        super(deviceInfo); 
        this.type = 'DualSense'; 
    }
    
    parseInputReport(reportId, data) {
        if (!data || data.byteLength < 10) return null;
        
        // Bulletproof Offset Detection: Check if Report ID is present
        let offset = 0;
        const firstByte = data.getUint8(0);
        if (firstByte === 0x01 || firstByte === 0x31) offset = 1;
        
        const b1 = data.getUint8(7 + offset);
        const b2 = data.getUint8(8 + offset);
        const b3 = data.getUint8(9 + offset); 
        const dpad = b1 & 0x0F;
        
        const dpadStates = { 0:{up:true}, 4:{down:true}, 6:{left:true}, 2:{right:true}, 8:{} };
        const d = dpadStates[dpad] || {};
        
        return {
            buttons: {
                dpadUp: d.up||false, dpadDown: d.down||false, dpadLeft: d.left||false, dpadRight: d.right||false,
                square: (b1&0x10)!==0, cross: (b1&0x20)!==0, circle: (b1&0x40)!==0, triangle: (b1&0x80)!==0,
                l1: (b2&0x01)!==0, r1: (b2&0x02)!==0,
                create: (b2&0x10)!==0, options: (b2&0x20)!==0, l3: (b2&0x40)!==0, r3: (b2&0x80)!==0,
                ps: (b3&0x01)!==0, touchpad: (b3&0x02)!==0, mute: (b3&0x04)!==0
            },
            axes: { 
                lx: (data.getUint8(0 + offset) - 128) / 127, 
                ly: (data.getUint8(1 + offset) - 128) / -127, 
                rx: (data.getUint8(2 + offset) - 128) / 127, 
                ry: (data.getUint8(3 + offset) - 128) / -127 
            },
            triggers: { 
                l2: data.getUint8(4 + offset)/255, 
                r2: data.getUint8(5 + offset)/255 
            },
            battery: { level: 100, charging: true } 
        };
    }
    
    async fetchHardwareInfo(hidEngine) {
        const data = await hidEngine.readFeatureReport(0x20);
        if (!data || data.byteLength < 10) return null;
        return { 
            firmwareVersion: `${data.getUint8(7)}.${data.getUint8(8)}`, 
            macAddress: HexUtils.extractMAC(data, 1) 
        };
    }
    
    async writeCalibrationData(hidEngine, payload) {
        const factoryData = await hidEngine.readFeatureReport(0x05);
        if (!factoryData) throw new Error("Cannot read FR 0x05");

        const size = factoryData.byteLength - 1;
        const arr = new Uint8Array(size);
        for (let i = 0; i < size; i++) arr[i] = factoryData.getUint8(i + 1);

        arr[0] = 0x10; // Sony Calibration Command Flag

        if (payload.type === 'center') {
            const cx = Math.round(payload.data.left.x * 32767);
            const cy = Math.round(payload.data.left.y * 32767);
            arr[4] = cx & 0xFF; arr[5] = (cx >> 8) & 0xFF;
            arr[6] = cy & 0xFF; arr[7] = (cy >> 8) & 0xFF;
        } else if (payload.type === 'range') {
            const minX = Math.round(payload.data.left.minX * 32767);
            const maxX = Math.round(payload.data.left.maxX * 32767);
            arr[8] = minX & 0xFF; arr[9] = (minX >> 8) & 0xFF;
            arr[10] = maxX & 0xFF; arr[11] = (maxX >> 8) & 0xFF;
        }

        return await hidEngine.sendFeatureReport(0x05, arr);
    }
}