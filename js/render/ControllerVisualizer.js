class ControllerVisualizer {
    constructor() {
        this.svg = document.getElementById('controller-svg');
        if (!this.svg) return;
        this.elements = {
            dpadUp: this.svg.querySelector('#btn-dpad-up'),
            dpadDown: this.svg.querySelector('#btn-dpad-down'),
            dpadLeft: this.svg.querySelector('#btn-dpad-left'),
            dpadRight: this.svg.querySelector('#btn-dpad-right'),
            triangle: this.svg.querySelector('#btn-triangle'),
            circle: this.svg.querySelector('#btn-circle'),
            cross: this.svg.querySelector('#btn-cross'),
            square: this.svg.querySelector('#btn-square'),
            l1: this.svg.querySelector('#btn-l1'),
            r1: this.svg.querySelector('#btn-r1'),
            l2: this.svg.querySelector('#btn-l2'),
            r2: this.svg.querySelector('#btn-r2'),
            l3: this.svg.querySelector('#btn-l3'),
            r3: this.svg.querySelector('#btn-r3'),
            ps: this.svg.querySelector('#btn-ps'),
            touchpad: this.svg.querySelector('#btn-touchpad'),
            share: this.svg.querySelector('#btn-share'),
            options: this.svg.querySelector('#btn-options')
        };
        document.addEventListener('state:render', (e) => this.update(e.detail));
    }
    
    update(state) {
        const buttons = state.buttons;
        // Update Digital Buttons
        for (const [key, el] of Object.entries(this.elements)) {
            if (!el || key === 'l2' || key === 'r2') continue;
            if (buttons[key]) el.classList.add('active');
            else el.classList.remove('active');
        }
        
        // Update Analog Triggers Visually
        if (state.triggers.l2 > 0.05) this.elements.l2?.classList.add('active');
        else this.elements.l2?.classList.remove('active');
        
        if (state.triggers.r2 > 0.05) this.elements.r2?.classList.add('active');
        else this.elements.r2?.classList.remove('active');
    }
}
export const controllerVisualizer = new ControllerVisualizer();