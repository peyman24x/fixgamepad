export class BaseController {
    constructor(deviceInfo) { this.deviceInfo = deviceInfo; this.type = 'Generic'; }
    parseInputReport(reportId, data) { throw new Error('Must implement'); }
    async fetchHardwareInfo(hidEngine) { return null; }
    async writeCalibrationData(hidEngine, data) { throw new Error('Not supported'); }
}