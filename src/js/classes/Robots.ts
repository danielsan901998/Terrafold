import { game, view } from '../../main';

export interface Job {
    workers: number;
    currentTicks?: number;
    ticksNeeded?: number;
    cost?: number[];
    costType?: string[];
    isMoving?: number | boolean;
    completions?: number;
    finish: (this: Job) => void;
    showing: (this: Job) => boolean;
    done?: (this: Job) => boolean;
    during?: (this: Job) => boolean;
}

export default class Robots {
    robots: number;
    robotsFree: number;
    robotMax: number;
    unlocked: number;
    ore: number;
    mines: number;
    failed: number;
    jobs: Job[];

    constructor() {
        this.robots = 0;
        this.robotsFree = 0;
        this.robotMax = 5;
        this.unlocked = 0;
        this.ore = 0;
        this.mines = 0;
        this.failed = 0;

        this.jobs = [
            { // Cut Trees
                workers: 0,
                finish: function () { if (game) game.robots.cutTrees(this.workers); },
                showing: function () { return true; }
            },
            { // Expand indoor water storage
                currentTicks: 0,
                ticksNeeded: 3000,
                workers: 0,
                cost: [.1],
                costType: ["metal"],
                finish: function () { 
                    if (this.ticksNeeded !== undefined) this.ticksNeeded += 1000; 
                    if (game) game.water.maxIndoor += 50; 
                },
                showing: function () { return true; }
            },
            { // Build Mines
                currentTicks: 0,
                ticksNeeded: 300,
                workers: 0,
                cost: [1],
                costType: ["wood"],
                finish: function () { 
                    if (game) game.robots.mines++; 
                    if (this.ticksNeeded !== undefined) this.ticksNeeded += 100; 
                },
                done: function () { 
                    return game ? game.robots.mines * 1000 >= game.land.optimizedLand : false; 
                },
                showing: function () { return true; }
            },
            { // Mine Ore
                workers: 0,
                finish: function () { if (game) game.robots.mineOre(this.workers); },
                showing: function () { return true; }
            },
            { // Smelt Ore
                workers: 0,
                finish: function () { if (game) game.robots.smeltOre(this.workers); },
                showing: function () { return true; }
            },
            { // Turn ore into dirt
                currentTicks: 0,
                ticksNeeded: 1000,
                workers: 0,
                during: function () {
                    if (game && game.power >= 1 * this.workers && game.robots.ore >= this.workers * 1000) {
                        game.power -= 1 * this.workers;
                        game.robots.ore -= this.workers * 1000;
                        return true;
                    }
                    return false;
                },
                finish: function () { if (game) game.land.addLand(50); },
                showing: function () { return game ? game.energy.unlocked !== 0 : false; }
            }
        ];
    }

    tick() {
        for (let i = 0; i < this.jobs.length; i++) {
            this.tickRow(this.jobs[i]!, this.jobs[i]!.workers);
        }
    }

    tickRow(row: Job, ticksGained: number) {
        if (ticksGained === 0 || (row.done && row.done())) {
            row.isMoving = 0;
            return;
        }
        if (row.ticksNeeded === undefined) { // No progress bar
            row.finish();
            return;
        }
        if (row.during && !row.during()) {
            row.isMoving = 0;
            return;
        }
        if (row.cost && row.costType) {
            for (let i = 0; i < row.cost.length; i++) {
                const cost = ticksGained * row.cost[i]!;
                const costType = row.costType[i];
                if (costType) {
                    if (game && (game as any)[costType] < cost) {
                        row.isMoving = 0;
                        return;
                    }
                }
            }
            for (let i = 0; i < row.cost.length; i++) {
                const costType = row.costType[i]!;
                if (game) (game as any)[costType] -= ticksGained * row.cost[i]!;
            }
        }


        row.currentTicks = (row.currentTicks || 0) + ticksGained;
        row.isMoving = 1;
        if (row.currentTicks >= row.ticksNeeded) {
            const overflow = row.currentTicks - row.ticksNeeded;
            row.currentTicks = 0;
            row.completions = (row.completions || 0) + 1;
            row.finish();
            this.tickRow(row, overflow); // recursive, but on the new cost
        }
    }

    gainRobots(amount: number) {
        this.robots += amount;
        this.robotsFree += amount;
    }

    gainStorage(amount: number) {
        this.robotMax += amount;
    }

    unlockRobots() {
        if (!game) return;
        if (game.cash >= 3000) {
            game.cash -= 3000;
            this.unlocked = 1;
            view?.checkRobotsUnlocked();
            this.gainRobots(1);
        }
        view?.updateComputer();
        view?.updateRobots();
    }

    failedRobots() {
        if (!game) return;
        if (game.cash >= 1e6) {
            game.cash -= 1e6;
            this.failed = 0;
            view?.checkRobotsUnlocked();
            this.gainRobots(1);
        }
        view?.updateRobots();
    }

    addWorker(dataPos: number, numAdding: number) {
        const job = this.jobs[dataPos];
        if (job) {
            numAdding = Math.min(numAdding, this.robotsFree);
            job.workers += numAdding;
            this.robotsFree -= numAdding;
        }
        view?.updateRobots();
    }

    removeWorker(dataPos: number, numRemoving: number) {
        const job = this.jobs[dataPos];
        if (job) {
            numRemoving = Math.min(numRemoving, job.workers);
            job.workers -= numRemoving;
            this.robotsFree += numRemoving;
        }
        view?.updateRobots();
    }

    cutTrees(mult: number) {
        if (game && game.trees.trees >= 2 * mult) {
            game.trees.trees -= 2 * mult;
            game.wood += mult;
        }
    }

    mineOre(mult: number) {
        if (game) game.robots.ore += game.robots.mines / 100 * mult;
    }

    smeltOre(mult: number) {
        if (game && game.wood >= 5 * mult && this.ore >= mult && game.oxygen >= mult * 1000) {
            game.wood -= 5 * mult;
            this.ore -= mult;
            game.oxygen -= 1000 * mult;
            game.metal += mult;
        }
    }
}

export const jobsView = [
    {
        text: "Cut Trees",
        tooltip: "Cut down 2 trees for 1 wood"
    },
    {
        text: "Expand indoor water storage",
        tooltip: "Gives 50 more max indoor water.<br>Cost increases by 1"
    },
    {
        text: "Build Mines",
        tooltip: "Build up to (total land / 1000) mines"
    },
    {
        text: "Mine Ore",
        tooltip: "Get (mines / 100) ore per tick"
    },
    {
        text: "Smelt Ore",
        tooltip: "Each tick costs 5 wood, 1 ore, and 1000 oxygen<br>Gain 1 metal"
    },
    {
        text: "Turn ore into dirt",
        tooltip: "Each tick costs 1 energy and 1000 ore<br>Gain 5 Base Land<br>Total land gained: <div id='totalDirtFromOre'></div>"
    }
];