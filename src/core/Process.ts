import { game } from '../main';

export class Process {
    text: string;
    tooltip: string;
    workers: number;
    currentTicks: number = 0;
    ticksNeeded: number;
    cost: number | number[];
    costType: string | string[];
    completions: number = 0;
    isMoving: boolean = false;
    spendingCategory?: { [key: string]: string };
    finish: (this: Process) => void;
    showing: (this: Process) => boolean;
    done?: (this: Process) => boolean;

    constructor(A: Partial<Process> & { threads?: number }) {
        this.text = A.text || "";
        this.tooltip = A.tooltip || "";
        this.workers = A.workers || A.threads || 0;
        this.currentTicks = A.currentTicks || 0;
        this.ticksNeeded = A.ticksNeeded || 0;
        this.cost = A.cost ?? 0;
        this.costType = A.costType ?? "";
        this.spendingCategory = A.spendingCategory;
        this.finish = A.finish || (() => { });
        this.showing = A.showing || (() => true);
        this.done = A.done;
    }

    tick(ticksGained: number, costMultiplier: number = 1, onSpend?: (type: string, amount: number) => void): number {
        if (ticksGained === 0 || (this.done && this.done())) {
            this.isMoving = false;
            return 0;
        }

        if (this.ticksNeeded === 0) {
            this.finish();
            return 0;
        }

        if (this.cost && this.costType) {
            const costs = Array.isArray(this.cost) ? this.cost : [this.cost];
            const costTypes = Array.isArray(this.costType) ? this.costType : [this.costType];

            for (let i = 0; i < costs.length; i++) {
                const totalCost = ticksGained * costs[i]! * costMultiplier;
                const type = costTypes[i];
                if (type && game && (game as any)[type] < totalCost) {
                    this.isMoving = false;
                    return 0;
                }
            }

            for (let i = 0; i < costs.length; i++) {
                const totalCost = ticksGained * costs[i]! * costMultiplier;
                const type = costTypes[i];
                if (type && game) {
                    (game as any)[type] -= totalCost;
                    if (onSpend) onSpend(type, totalCost);
                }
            }
        }

        this.currentTicks += ticksGained;
        this.isMoving = true;
        let completionsGained = 0;
        while (this.currentTicks >= this.ticksNeeded) {
            this.currentTicks -= this.ticksNeeded;
            this.completions++;
            this.finish();
            completionsGained++;
        }
        return completionsGained;
    }
}
