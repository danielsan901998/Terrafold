import { game } from '../main';
import { precision2, precision3 } from '../utils/utils';

export interface Process {
    text: string;
    tooltip: string;
    currentTicks: number;
    ticksNeeded: number;
    threads: number;
    cost: number;
    costType: string;
    completions?: number;
    isMoving?: number | boolean;
    finish: (this: Process) => void;
    showing: (this: Process) => boolean;
    done?: (this: Process) => boolean;
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
            {
                // Optimize Land
                text: "Optimize Land",
                tooltip: "Improve 1% of unimproved land.<br>Max to improve to is ( 10 x base land )<br>Percent Optimized: <div id='landOptimized'></div>",
                currentTicks: 0,
                ticksNeeded: 600,
                threads: 0,
                cost: 0,
                costType: "",
                finish: function () {
                    if (game) game.land.improveLand();
                    if (game) this.ticksNeeded = Math.floor(game.land.baseLand);
                },
                showing: function () {
                    return true;
                },
            },
            {
                // Buy Ice
                text: "Buy Ice",
                tooltip: "Buy available ice",
                currentTicks: 0,
                ticksNeeded: 50,
                threads: 0,
                cost: 0,
                costType: "",
                finish: function () {
                    if (game) game.buyIce();
                },
                showing: function () {
                    return true;
                },
            },
            {
                // Sell Water
                text: "Sell Water",
                tooltip: "Sells up to 50 water",
                currentTicks: 0,
                ticksNeeded: 50,
                threads: 0,
                cost: 0,
                costType: "",
                finish: function () {
                    if (game) game.water.sellWater(50);
                },
                showing: function () {
                    return true;
                },
            },
            {
                // Improve Farms
                text: "Improve Farms",
                tooltip: "Farm efficiency increases by 2%",
                currentTicks: 0,
                ticksNeeded: 40,
                threads: 0,
                cost: 0,
                costType: "",
                finish: function () {
                    if (game) game.farms.improve();
                    this.ticksNeeded = precision3(
                        20 * ((this.completions || 0) + 2) + Math.pow((this.completions || 0), 2) / 10,
                    );
                },
                showing: function () {
                    return true;
                },
            },
            {
                // Find more Ice Sellers
                text: "Find more Ice Sellers",
                tooltip: "Gain 200 buyable ice and 1 more per tick",
                currentTicks: 0,
                ticksNeeded: 2000,
                threads: 0,
                cost: 0.5,
                costType: "cash",
                finish: function () {
                    if (game) game.ice.findIceSeller(1);
                },
                showing: function () {
                    return true;
                },
            },
            {
                // Bigger Storms
                text: "Bigger Storms",
                tooltip: "Storms last 5 more ticks. Max 300 duration.",
                currentTicks: 0,
                ticksNeeded: 600,
                threads: 0,
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
            },
            {
                // Build Robots
                text: "Build Robots",
                tooltip: "Builds a robot",
                currentTicks: 0,
                ticksNeeded: 10000,
                threads: 0,
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
            },
            {
                // More Robot Storage
                text: "More Robot Storage",
                tooltip: "Can hold 5 more robots",
                currentTicks: 0,
                ticksNeeded: 20000,
                threads: 0,
                cost: 0.5,
                costType: "wood",
                finish: function () {
                    if (game) game.robots.gainStorage(5);
                    this.ticksNeeded += 2000;
                },
                showing: function () {
                    return game ? game.robots.unlocked !== 0 : false;
                },
            },
            {
                // Improve House Design
                text: "Improve House Design",
                tooltip: "Improves base happiness modifier by .1",
                currentTicks: 0,
                ticksNeeded: 3000,
                threads: 0,
                cost: 10,
                costType: "science",
                finish: function () {
                    if (game) game.population.improveHouse();
                    this.ticksNeeded += 500;
                },
                showing: function () {
                    return game ? game.robots.unlocked !== 0 : false;
                },
            },
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
            row.isMoving = 0;
            return;
        }

        if (row.done && row.done()) {
            row.isMoving = 0;
            if (row.threads > 0) {
                this.freeThreads += row.threads;
                row.threads = 0;
            }
            game?.events.emit('computer:updated');
            return;
        }
        row.isMoving = 1;
        const cost = ticksGained * row.cost;
        if (row.costType) {
            if (game && (game as any)[row.costType] < cost) {
                row.isMoving = 0;
                return;
            }
            if (game) (game as any)[row.costType] -= cost;
        }
        row.currentTicks += ticksGained;
        row.isMoving = 1;
        while (row.currentTicks >= row.ticksNeeded) {
            const overflow = row.currentTicks - row.ticksNeeded;
            row.currentTicks = 0;
            row.completions = (row.completions || 0) + 1;
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
        game.events.emit('computer:updated');
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
