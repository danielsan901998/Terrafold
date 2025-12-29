export default abstract class BaseView {
    protected textCache: Map<string, string> = new Map();

    protected getElement(id: string): HTMLElement {
        const el = document.getElementById(id);
        if (!el) throw new Error(`Element ${id} not found`);
        return el;
    }

    protected updateElementText(id: string, value: string | number) {
        const strValue = value.toString();
        if (this.textCache.get(id) === strValue) return;
        this.getElement(id).textContent = strValue;
        this.textCache.set(id, strValue);
    }
}
