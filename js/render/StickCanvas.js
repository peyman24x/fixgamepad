class StickCanvas {
    constructor(canvasId, color, axisX, axisY) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.color = color; this.axisX = axisX; this.axisY = axisY;
        this.size = this.canvas.width; this.center = this.size / 2; this.radius = this.center * 0.9;
        this.trail = []; this.maxTrailLength = 30; // Reduced for performance
        document.addEventListener('state:render', (e) => this.draw(e.detail.axes));
    }
    draw(axes) {
        const ctx = this.ctx;
        const x = axes[this.axisX] || 0; const y = axes[this.axisY] || 0;
        ctx.clearRect(0, 0, this.size, this.size);
        
        // Grid drawing optimized
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.center, this.center, this.radius, 0, Math.PI * 2);
        ctx.moveTo(this.center + this.radius, this.center); ctx.arc(this.center, this.center, this.radius * 0.5, 0, Math.PI * 2);
        ctx.moveTo(this.center, 0); ctx.lineTo(this.center, this.size);
        ctx.moveTo(0, this.center); ctx.lineTo(this.size, this.center);
        ctx.stroke();
        
        const xPos = this.center + (x * this.radius); const yPos = this.center - (y * this.radius);
        this.trail.push({ x: xPos, y: yPos });
        if (this.trail.length > this.maxTrailLength) this.trail.shift();
        
        // Trail drawing optimized
        for (let i = 0; i < this.trail.length; i++) {
            const p = this.trail[i]; const opacity = i / this.trail.length;
            ctx.fillStyle = `rgba(${this.color}, ${opacity * 0.5})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
        }
        
        ctx.strokeStyle = `rgba(${this.color}, 0.8)`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(this.center, this.center); ctx.lineTo(xPos, yPos); ctx.stroke();
        ctx.fillStyle = `rgba(${this.color}, 1)`;
        ctx.beginPath(); ctx.arc(xPos, yPos, 6, 0, Math.PI * 2); ctx.fill();
    }
}
export const initStickCanvases = () => {
    new StickCanvas('left-stick-canvas', '46, 204, 113', 'lx', 'ly');
    new StickCanvas('right-stick-canvas', '52, 152, 219', 'rx', 'ry');
};