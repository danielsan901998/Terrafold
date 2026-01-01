import { game } from '../main';

export class Job {
    text: string;
    tooltip: string;
    workers: number;
    currentTicks: number = 0;
    ticksNeeded: number = 0;
    cost?: number[];
    costType?: string[];
    isMoving: boolean = false;
    completions: number = 0;
    finish: (this: Job) => void;
    showing: (this: Job) => boolean;
    done?: (this: Job) => boolean;
    during?: (this: Job) => boolean;

    constructor(A: Partial<Job>) {
        this.text = A.text || "";
        this.tooltip = A.tooltip || "";
        this.workers = A.workers || 0;
        this.ticksNeeded = A.ticksNeeded || 0;
        this.cost = A.cost;
        this.costType = A.costType;
        this.finish = A.finish || (() => { });
        this.showing = A.showing || (() => true);
        this.done = A.done;
        this.during = A.during;
    }
}

export default class Robots {
    robots: number;
    robotsFree: number;
    robotMax: number;
    unlocked: number;
    ore: number;
    mines: number;
    jobs: Job[];
    woodIncome: number = 0;
    woodSpending: number = 0;
    metalIncome: number = 0;
    metalSpending: number = 0;
    oxygenSpending: number = 0;

    constructor() {
        this.robots = 0;
        this.robotsFree = 0;
        this.robotMax = 5;
        this.unlocked = 0;
        this.ore = 0;
        this.mines = 0;

        this.jobs = [
            new Job({ // Cut Trees
                text: "Cut Trees",
                tooltip: "Cut down 2 trees for 1 wood",
                finish: function () { if (game) game.robots.cutTrees(this.workers); }
            }),
            new Job({ // Expand indoor water storage
                text: "Expand indoor water storage",
                tooltip: "Gives 50 more max indoor water.<br>Cost increases by 1",
                ticksNeeded: 3000,
                cost: [.1],
                costType: ["metal"],
                finish: function () {
                    this.ticksNeeded += 1000;
                    if (game) game.water.maxIndoor += 50;
                }
            }),
            new Job({ // Build Mines
                text: "Build Mines",
                tooltip: "Build up to (total land / 1000) mines",
                ticksNeeded: 300,
                cost: [1],
                costType: ["wood"],
                finish: function () {
                    if (game) game.robots.mines++;
                    this.ticksNeeded += 100;
                },
                done: function () {
                    return game ? game.robots.mines * 1000 >= game.land.optimizedLand : false;
                }
            }),
            new Job({ // Mine Ore
                text: "Mine Ore",
                tooltip: "Get (mines / 100) ore per tick",
                finish: function () { if (game) game.robots.mineOre(this.workers); }
            }),
            new Job({ // Smelt Ore
                text: "Smelt Ore",
                tooltip: "Each tick costs 5 wood, 1 ore, and 1000 oxygen<br>Gain 1 metal",
                finish: function () { if (game) game.robots.smeltOre(this.workers); }
            }),
            new Job({ // Turn ore into dirt
                text: "Turn ore into dirt",
                tooltip: "Each tick costs 1 energy and 1000 ore<br>Gain 5 Base Land<br>Total land gained: <span id='totalDirtFromOre'></span>",
                ticksNeeded: 1000,
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
            })
        ];
    }

    tick() {
        this.woodIncome = 0;
        this.woodSpending = 0;
        this.metalIncome = 0;
        this.metalSpending = 0;
        this.oxygenSpending = 0;
        for (let i = 0; i < this.jobs.length; i++) {
            this.tickRow(this.jobs[i]!, this.jobs[i]!.workers);
        }
    }

    tickRow(row: Job, ticksGained: number) {
        if (ticksGained === 0 || (row.done && row.done())) {
            row.isMoving = false;
            return;
        }
        if (row.ticksNeeded === 0) { // No progress bar
            row.finish();
            return;
        }
        if (row.during && !row.during()) {
            row.isMoving = false;
            return;
        }
        if (row.cost && row.costType) {
            for (let i = 0; i < row.cost.length; i++) {
                const cost = ticksGained * row.cost[i]!;
                const costType = row.costType[i];
                if (costType) {
                    if (game && (game as any)[costType] < cost) {
                        row.isMoving = false;
                        return;
                    }
                }
            }
            for (let i = 0; i < row.cost.length; i++) {
                const costType = row.costType[i]!;
                const costAmount = ticksGained * row.cost[i]!;
                if (game) (game as any)[costType] -= costAmount;
                if (costType === "wood") this.woodSpending += costAmount;
                if (costType === "metal") this.metalSpending += costAmount;
            }
        }


        row.currentTicks += ticksGained;
        row.isMoving = true;
        if (row.currentTicks >= row.ticksNeeded) {
            const overflow = row.currentTicks - row.ticksNeeded;
            row.currentTicks = 0;
            row.completions++;
            row.finish();
            game?.events.emit('robots:updated');
            this.tickRow(row, overflow); // recursive, but on the new cost
        }
    }

    gainRobots(amount: number) {
        this.robots += amount;
        this.robotsFree += amount;
        game?.events.emit('robots:updated');
    }

    gainStorage(amount: number) {
        this.robotMax += amount;
        game?.events.emit('robots:updated');
    }

    unlockRobots() {
        if (!game) return;
        if (game.cash >= 3000) {
            game.cash -= 3000;
            this.unlocked = 1;
            game.events.emit('robots:unlocked');
            this.gainRobots(1);
        }
        game.events.emit('robots:updated');
    }

    addWorker(dataPos: number, numAdding: number) {
        const job = this.jobs[dataPos];
        if (job) {
            numAdding = Math.min(numAdding, this.robotsFree);
            job.workers += numAdding;
            this.robotsFree -= numAdding;
        }
        game?.events.emit('robots:updated');
    }

    removeWorker(dataPos: number, numRemoving: number) {
        const job = this.jobs[dataPos];
        if (job) {
            numRemoving = Math.min(numRemoving, job.workers);
            job.workers -= numRemoving;
            this.robotsFree += numRemoving;
        }
        game?.events.emit('robots:updated');
    }

    cutTrees(mult: number) {
        if (game && game.trees.trees >= 2 * mult) {
            game.trees.trees -= 2 * mult;
            game.wood += mult;
            this.woodIncome += mult;
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
            this.woodSpending += 5 * mult;
            this.oxygenSpending += 1000 * mult;
            this.metalIncome += mult;
        }
    }
}
