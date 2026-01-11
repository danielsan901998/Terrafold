import { intToString } from '../utils/utils';

export default abstract class BaseView {
    protected textCache: Map<string, string> = new Map();
    protected elementCache: Map<string, HTMLElement> = new Map();

    public clearCache() {
        this.textCache.clear();
        this.elementCache.clear();
    }

    protected getAmount(id: string): number {
        if (!this.elementExists(id)) return 1;
        const el = this.getElement(id) as HTMLInputElement;
        return Number(el.value) || 1;
    }

    protected setupAmountCostListener(inputId: string, mappings: { spanId: string, costPerUnit: number }[]) {
        if (!this.elementExists(inputId)) return;
        const el = this.getElement(inputId);
        const update = () => {
            const amount = this.getAmount(inputId);
            this.updateCostSpans(amount, mappings);
        };
        el.addEventListener('change', update);
        el.addEventListener('input', update);
    }

    protected updateCostSpans(amount: number, mappings: { spanId: string, costPerUnit: number }[]) {
        for (const mapping of mappings) {
            if (this.elementExists(mapping.spanId)) {
                this.updateElementText(mapping.spanId, intToString(amount * mapping.costPerUnit));
            }
        }
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

    protected elementExists(id: string): boolean {
        return this.elementCache.has(id) || document.getElementById(id) !== null;
    }

    protected setVisible(id: string, visible: boolean) {
        if (!this.elementExists(id)) return;
        const el = this.getElement(id);
        if (visible) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    }

    public abstract update(): void;

    public updateFull() {
        this.update();
    }
}
