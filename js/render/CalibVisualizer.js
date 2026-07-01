export class CalibVisualizer {
    constructor() {
        this.leftCanvas = document.getElementById('calib-left-canvas');
        this.rightCanvas = document.getElementById('calib-right-canvas');
        if (this.leftCanvas && this.rightCanvas) {
            this.leftCtx = this.leftCanvas.getContext('2d');
            this.rightCtx = this.rightCanvas.getContext('2d');
            this.size = 120;
            this.center = 60;
            this.radius = 50;
        }
    }

    draw(data) {
        if (!this.leftCtx) return;
        this.drawStick(this.leftCtx, data.left);
        this.drawStick(this.rightCtx, data.right);
    }

    drawStick(ctx, stickData) {
        const x = stickData.x;
        const y = stickData.y;
        const bounds = stickData.bounds;
        
        ctx.clearRect(0, 0, this.size, this.size);
        
        // Draw Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.center, this.center, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.center, 10); ctx.lineTo(this.center, 110);
        ctx.moveTo(10, this.center); ctx.lineTo(110, this.center);
        ctx.stroke();
        
        // Draw Bounding Box (The progress made)
        const minX = this.center + (bounds.minX * this.radius);
        const maxX = this.center + (bounds.maxX * this.radius);
        const minY = this.center - (bounds.maxY * this.radius);
        const maxY = this.center - (bounds.minY * this.radius);
        
        ctx.strokeStyle = 'rgba(46, 204, 113, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
        
        // Draw Current Position
        const xPos = this.center + (x * this.radius);
        const yPos = this.center - (y * this.radius);
        
        ctx.fillStyle = '#00d2ff';
        ctx.shadowColor = '#00d2ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(xPos, yPos, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}