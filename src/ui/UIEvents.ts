import EventEmitter from "../utils/EventEmitter";

export default class UIEvents {
    private static pendingNotifications: Map<(...args: any[]) => void, any[]> = new Map();
    private static specialEvents: { listener: (...args: any[]) => void, args: any[] }[] = [];
    private static notifiedThisCycle: Set<any> = new Set();
    private static initialized = false;
    private static isBatching = false;

    private static init() {
        if (this.initialized) return;
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.flush();
            }
        });
        this.initialized = true;
    }

    public static startBatch() {
        this.isBatching = true;
        this.notifiedThisCycle.clear();
    }

    public static endBatch() {
        this.isBatching = false;
        if (!document.hidden)
          this.flush();
    }

    public static on(emitter: EventEmitter | undefined, event: string, listener: (...args: any[]) => void) {
        if (!emitter) return;
        this.init();
        
        emitter.on(event, (...args: any[]) => {
            if (document.hidden || this.isBatching) {
                if (event === 'tractorBeam:removeComet') {
                    this.specialEvents.push({ listener, args });
                } else {
                    // For most UI updates, deduplicating per listener is enough
                    this.pendingNotifications.set(listener, args);
                }
            } else {
                listener(...args);
            }
        });
    }

    /**
     * Ensures that a listener is only called once per batch/flush cycle.
     * @param listener The function to call
     * @param key Optional key for deduplication. If not provided, the listener function itself is used.
     */
    public static notifyOnlyOnce(listener: (...args: any[]) => void, key?: any) {
        const id = key || listener;
        if (this.notifiedThisCycle.has(id)) return;
        this.notifiedThisCycle.add(id);
        listener();
    }

    private static flush() {
        if (this.pendingNotifications.size === 0 && this.specialEvents.length === 0) {
            this.notifiedThisCycle.clear();
            return;
        }

        const notifications = new Map(this.pendingNotifications);
        this.pendingNotifications.clear();
        
        const specials = [...this.specialEvents];
        this.specialEvents = [];

        this.notifiedThisCycle.clear();
        
        // Call special events first (like removing comets)
        specials.forEach(s => s.listener(...s.args));
        
        // Then call deduplicated UI updates
        notifications.forEach((args, listener) => listener(...args));
        
        this.notifiedThisCycle.clear();
    }
}
