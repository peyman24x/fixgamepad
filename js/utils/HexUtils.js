export const HexUtils = {
    toHex(byte) { return byte.toString(16).toUpperCase().padStart(2, '0'); },
    extractMAC(dataView, offset) {
        const mac = [];
        for (let i = 0; i < 6; i++) if (offset + i < dataView.byteLength) mac.push(this.toHex(dataView.getUint8(offset + i)));
        return mac.join(':');
    }
};