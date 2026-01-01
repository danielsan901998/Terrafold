import { game } from '../main';
import { precision2, precision3 } from '../utils/utils';

export class Process {
    text: string;
    tooltip: string;
    currentTicks: number = 0;
    ticksNeeded: number;
    threads: number;
    cost: number;
    costType: string;
    completions: number = 0;
    isMoving: boolean = false;
    finish: (this: Process) => void;
    showing: (this: Process) => boolean;
    done?: (this: Process) => boolean;

    constructor(A: Partial<Process>) {
        this.text = A.text || "";
        this.tooltip = A.tooltip || "";
        this.currentTicks = A.currentTicks || 0;
        this.ticksNeeded = A.ticksNeeded || 0;
        this.threads = A.threads || 0;
        this.cost = A.cost || 0;
        this.costType = A.costType || "";
        this.finish = A.finish || (() => { });
        this.showing = A.showing || (() => true);
        this.done = A.done;
    }
}

export default class Computer {
    unlocked: number;
    threads: number;
    freeThreads: number;
    speed: number;
    processes: Process[];

    constructor() {
        this.unlocked = 0;
        this.threads = 1;
        this.freeThreads = 1;
        this.speed = 1;

        this.processes = [
            new Process({
                // Optimize Land
                text: "Optimize Land",
                tooltip: "Improve 1% of unimproved land.<br>Max to improve to is ( 10 x base land )<br>Percent Optimized: <div id='landOptimized'></div>",
                ticksNeeded: 600,
                finish: function () {
                    if (game) game.land.improveLand();
                    if (game) this.ticksNeeded = Math.floor(game.land.baseLand);
                    game?.events.emit('computer:updated');
                },
            }),
            new Process({
                // Buy Ice
                text: "Buy Ice",
                tooltip: "Buy available ice",
                ticksNeeded: 50,
                finish: function () {
                    if (game) game.buyIce();
                },
            }),
            new Process({
                // Sell Water
                text: "Sell Water",
                tooltip: "Sells up to 50 water",
                ticksNeeded: 50,
                finish: function () {
                    if (game) game.water.sellWater(50);
                },
            }),
            new Process({
                // Improve Farms
                text: "Improve Farms",
                tooltip: "Farm efficiency increases by 2%",
                ticksNeeded: 40,
                finish: function () {
                    if (game) game.farms.improve();
                    this.ticksNeeded = precision3(
                        20 * (this.completions + 2) + Math.pow(this.completions, 2) / 10,
                    );
                },
            }),
            new Process({
                // Find more Ice Sellers
                text: "Find more Ice Sellers",
                tooltip: "Gain 200 buyable ice and 1 more per tick",
                ticksNeeded: 2000,
                cost: 0.5,
                costType: "cash",
                finish: function () {
                    if (game) game.ice.findIceSeller(1);
                },
            }),
            new Process({
                // Bigger Storms
                text: "Bigger Storms",
                tooltip: "Storms last 5 more ticks. Max 300 duration.",
                ticksNeeded: 600,
                cost: 2,
                costType: "science",
                finish: function () {
                    if (game) game.clouds.gainStormDuration(5);
                    this.cost += 0.5;
                    this.ticksNeeded += 50;
                },
                done: function () {
                    return game ? game.clouds.initialStormDuration >= 300 : false;
                },
                showing: function () {
                    return !this.done?.();
                },
            }),
            new Process({
                // Build Robots
                text: "Build Robots",
                tooltip: "Builds a robot",
                ticksNeeded: 10000,
                cost: 0.01,
                costType: "metal",
                finish: function () {
                    if (game) game.robots.gainRobots(1);
                },
                showing: function () {
                    return game ? game.robots.unlocked !== 0 : false;
                },
                done: function () {
                    return game ? game.robots.robots >= game.robots.robotMax : false;
                },
            }),
            new Process({
                // More Robot Storage
                text: "More Robot Storage",
                tooltip: "Can hold 5 more robots",
                ticksNeeded: 20000,
                cost: 0.5,
                costType: "wood",
                finish: function () {
                    if (game) game.robots.gainStorage(5);
                    this.ticksNeeded += 2000;
                },
                showing: function () {
                    return game ? game.robots.unlocked !== 0 : false;
                },
            }),
            new Process({
                // Improve House Design
                text: "Improve House Design",
                tooltip: "Improves base happiness modifier by .1",
                ticksNeeded: 3000,
                cost: 10,
                costType: "science",
                finish: function () {
                    if (game) game.population.improveHouse();
                    this.ticksNeeded += 500;
                },
                showing: function () {
                    return game ? game.robots.unlocked !== 0 : false;
                },
            }),
        ];
    }

    tick() {
        for (let i = 0; i < this.processes.length; i++) {
            const process = this.processes[i]!;
            this.tickRow(process, this.speed * process.threads);
        }
    }

    tickRow(row: Process, ticksGained: number) {
        if (ticksGained === 0) {
            row.isMoving = false;
            return;
        }

        if (row.done && row.done()) {
            row.isMoving = false;
            if (row.threads > 0) {
                this.freeThreads += row.threads;
                row.threads = 0;
            }
            return;
        }
        row.isMoving = true;
        const cost = ticksGained * row.cost;
        if (row.costType) {
            if (game && (game as any)[row.costType] < cost) {
                row.isMoving = false;
                return;
            }
            if (game) (game as any)[row.costType] -= cost;
        }
        row.currentTicks += ticksGained;
        while (row.currentTicks >= row.ticksNeeded) {
            const overflow = row.currentTicks - row.ticksNeeded;
            row.currentTicks = 0;
            row.completions++;
            row.finish();
            row.currentTicks = overflow; // Set currentTicks to the overflow for the next iteration
        }
    }

    unlockComputer() {
        if (!game) return;
        if (game.science >= 1000) {
            game.science -= 1000;
            this.unlocked = 1;
            game.events.emit('computer:unlocked');
        }
    }

    buyThread() {
        if (!game) return;
        const threadCost = this.getThreadCost();
        if (game.cash >= threadCost) {
            game.cash -= threadCost;
            this.threads++;
            this.freeThreads++;
            game.events.emit('computer:updated');
        }
    }

    getThreadCost() {
        return precision2(Math.pow(2, this.threads) * 500);
    }

    buySpeed() {
        if (!game) return;
        const speedCost = this.getSpeedCost();
        if (game.science >= speedCost) {
            game.science -= speedCost;
            this.speed++;
            game.events.emit('computer:updated');
        }
    }

    getSpeedCost() {
        return precision2(Math.pow(2, this.speed) * 500);
    }

    addThread(dataPos: number, numAdding: number) {
        numAdding = Math.min(numAdding, this.freeThreads);
        const proc = this.processes[dataPos];
        if (proc) {
            proc.threads += numAdding;
            this.freeThreads -= numAdding;
            game?.events.emit('computer:updated');
        }
    }

    removeThread(dataPos: number, numRemoving: number) {
        const proc = this.processes[dataPos];
        if (proc) {
            numRemoving = Math.min(numRemoving, proc.threads);
            proc.threads -= numRemoving;
            this.freeThreads += numRemoving;
            game?.events.emit('computer:updated');
        }
    }
}
