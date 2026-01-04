export default abstract class BaseView {
    protected textCache: Map<string, string> = new Map();
    protected elementCache: Map<string, HTMLElement> = new Map();

    public clearCache() {
        this.textCache.clear();
        this.elementCache.clear();
    }

    protected getElement(id: string): HTMLElement {
        let el: HTMLElement | undefined = this.elementCache.get(id);
        if (!el) {
            const domEl = document.getElementById(id);
            if (!domEl) throw new Error(`Element ${id} not found`);
            el = domEl;
            this.elementCache.set(id, el);
        }
        return el;
    }

    protected updateElementText(id: string, value: string) {
        if (this.textCache.get(id) === value) return;

        this.getElement(id).textContent = value;
        this.textCache.set(id, value);
    }

    protected updateElementHTML(id: string, value: string) {
        if (this.textCache.get(id) === value) return;

        this.getElement(id).innerHTML = value;
        this.textCache.set(id, value);
    }

    protected setVisible(id: string, visible: boolean) {
        const el = this.getElement(id);
        if (visible) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    }
}
