class EventBus {
    constructor() { this.events = new Map(); }
    on(eventName, callback) {
        if (!this.events.has(eventName)) this.events.set(eventName, []);
        this.events.get(eventName).push(callback);
    }
    emit(eventName, data) {
        if (!this.events.has(eventName)) return;
        for (const callback of this.events.get(eventName)) callback(data);
    }
}
export const eventBus = new EventBus();