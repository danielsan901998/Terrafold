import EventEmitter from "../utils/EventEmitter";

export default class UIEvents {
    private static pendingEvents: Map<string, any[][]> = new Map();
    private static listeners: Map<string, ((...args: any[]) => void)[]> = new Map();
    private static initialized = false;

    private static init() {
        if (this.initialized) return;
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.flush();
            }
        });
        this.initialized = true;
    }

    public static on(emitter: EventEmitter | undefined, event: string, listener: (...args: any[]) => void) {
        if (!emitter) return;
        this.init();
        
        // We use a internal listener to the emitter to manage the queue
        // But we need to keep track of ALL listeners for this event to call them
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
            emitter.on(event, (...args: any[]) => {
                if (document.hidden) {
                    // Accumulate events if hidden
                    if (event === 'tractorBeam:removeComet') {
                        // For comet removal, we might want all of them
                        if (!this.pendingEvents.has(event)) this.pendingEvents.set(event, []);
                        this.pendingEvents.get(event)!.push(args);
                    } else {
                        // For most UI updates, just keeping the last one is enough
                        this.pendingEvents.set(event, [args]);
                    }
                } else {
                    this.notify(event, args);
                }
            });
        }
        this.listeners.get(event)!.push(listener);
    }

    private static notify(event: string, args: any[]) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            // Use a copy to avoid issues if listeners are added/removed during notification
            [...eventListeners].forEach(l => l(...args));
        }
    }

    private static flush() {
        // Create a copy and clear to avoid recursion issues
        const toFlush = new Map(this.pendingEvents);
        this.pendingEvents.clear();

        toFlush.forEach((allArgs, event) => {
            allArgs.forEach(args => this.notify(event, args));
        });
    }
}
