import { eventBus } from '../core/EventBus.js';
class Terminal {
    constructor() {
        this.terminalEl = document.getElementById('terminal-output');
        this.maxLines = 50; // Prod limit to prevent DOM bloat
        eventBus.on('log', ({ type, message }) => this.addLine(type, message));
    }
    addLine(type, message) {
        if (!this.terminalEl) return;
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        const line = document.createElement('div');
        line.className = `terminal-line log-${type}`;
        line.innerHTML = `<span class="terminal-time">[${time}]</span> <span class="terminal-type">${type.toUpperCase().padEnd(7, ' ')}</span> <span class="terminal-msg">${message}</span>`;
        this.terminalEl.appendChild(line);
        if (this.terminalEl.children.length > this.maxLines) this.terminalEl.removeChild(this.terminalEl.firstChild);
        this.terminalEl.scrollTop = this.terminalEl.scrollHeight;
    }
}
export const terminal = new Terminal();