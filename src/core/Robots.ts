import { game } from '../main';
import { Process } from './Process';

export default class Robots {
    robots: number;
    robotsFree: number;
    robotMax: number;
    unlocked: number;
    mines: number;
    jobs: Process[];
    woodIncome: number = 0;
    woodSpending: number = 0;
    metalIncome: number = 0;
    metalSpending: number = 0;
    oreIncome: number = 0;
    oreSpending: number = 0;
    oreToDirtSpending: number = 0;
    oxygenSpending: number = 0;

    constructor() {
        this.robots = 0;
        this.robotsFree = 0;
        this.robotMax = 5;
        this.unlocked = 0;
        this.mines = 0;

        this.jobs = [
            new Process({ // Cut Trees
                text: "Cut Trees",
                tooltip: "Cut down 2 trees for 1 wood",
                finish: function () { if (game) game.robots.cutTrees(this.workers); }
            }),
            new Process({ // Expand indoor water storage
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
            new Process({ // Build Mines
                text: "Build Mines",
                tooltip: "Build mines to get ore. Limit: <span id='minesLimit'></span>. Currently: <span id='minesCount'></span>",
                ticksNeeded: 300,
                cost: [1],
                costType: ["wood"],
                finish: function () {
                    if (game) {
                        game.robots.mines++;
                        game.events.emit('robots:mines:updated');
                    }
                    this.ticksNeeded += 200 + this.completions * 50;
                },
                done: function () {
                    if (!game) return false;
                    const landUnits = game.land.optimizedLand / 1000;
                    const limit = Math.floor(Math.pow(landUnits, 2) / 10);
                    return game.robots.mines >= limit;
                }
            }),
            new Process({ // Mine Ore
                text: "Mine Ore",
                tooltip: "Get (mines / 100) ore per tick",
                finish: function () { if (game) game.robots.mineOre(this.workers); }
            }),
            new Process({ // Smelt Ore
                text: "Smelt Ore",
                tooltip: "Each tick costs 5 wood, 1 ore, and 1000 oxygen<br>Gain 1 metal",
                finish: function () { if (game) game.robots.smeltOre(this.workers); }
            }),
            new Process({ // Turn ore into dirt
                text: "Turn ore into dirt",
                tooltip: "Each tick costs 1 energy and 1000 ore<br>Gain 5 Base Land<br>Total land gained: <span id='totalDirtFromOre'></span>",
                ticksNeeded: 1000,
                cost: [1, 1000],
                costType: ["power", "ore"],
                spendingCategory: { "ore": "oreToDirtSpending" },
                finish: function () { if (game) game.land.addLand(50); },
                showing: false,
            })
        ];

        if (game) {
            game.events.on('energy:unlocked', () => {
                const proc = this.jobs.find(p => p.text === "Turn ore into dirt");
                if (proc) proc.showing = true;
            });
        }
    }

    tick() {
        this.woodIncome = 0;
        this.woodSpending = 0;
        this.metalIncome = 0;
        this.metalSpending = 0;
        this.oreIncome = 0;
        this.oreSpending = 0;
        this.oreToDirtSpending = 0;
        this.oxygenSpending = 0;
        for (let i = 0; i < this.jobs.length; i++) {
            this.tickRow(this.jobs[i]!, this.jobs[i]!.workers);
        }
    }

    tickRow(row: Process, ticksGained: number) {
        if (!game) return;
        
        const completions = row.tick(ticksGained, 1, (type, amount) => {
            const category = (row.spendingCategory?.[type] || (type + "Spending")) as keyof Robots;
            if (this[category] !== undefined && typeof this[category] === 'number') {
                (this[category] as number) += amount;
            }
        });

        if (completions > 0) {
            game.events.emit('robots:count:updated');
        }
    }

    gainRobots(amount: number) {
        this.robots += amount;
        this.robotsFree += amount;
        game?.events.emit('robots:count:updated');
    }

    gainStorage(amount: number) {
        this.robotMax += amount;
        game?.events.emit('robots:storage:updated');
    }

    unlockRobots() {
        if (!game) return;
        if (game.cash >= 3000) {
            game.cash -= 3000;
            this.unlocked = 1;
            game.events.emit('robots:unlocked');
            this.gainRobots(1);
        }
        game.events.emit('robots:count:updated');
        game.events.emit('robots:storage:updated');
    }

    addWorker(dataPos: number, numAdding: number) {
        const job = this.jobs[dataPos];
        if (job) {
            numAdding = Math.min(numAdding, this.robotsFree);
            job.workers += numAdding;
            this.robotsFree -= numAdding;
        }
        game?.events.emit('robots:count:updated');
    }

    removeWorker(dataPos: number, numRemoving: number) {
        const job = this.jobs[dataPos];
        if (job) {
            numRemoving = Math.min(numRemoving, job.workers);
            job.workers -= numRemoving;
            this.robotsFree += numRemoving;
        }
        game?.events.emit('robots:count:updated');
    }

    cutTrees(mult: number) {
        if (game && game.trees.trees >= 2 * mult) {
            game.trees.trees -= 2 * mult;
            game.wood += mult;
            this.woodIncome += mult;
        }
    }

    mineOre(mult: number) {
        if (game) {
            const gain = game.robots.mines / 100 * mult;
            game.ore += gain;
            this.oreIncome += gain;
        }
    }

    smeltOre(mult: number) {
        if (game && game.wood >= 5 * mult && game.ore >= mult && game.oxygen >= mult * 1000) {
            game.wood -= 5 * mult;
            game.ore -= mult;
            game.oxygen -= 1000 * mult;
            game.metal += mult;
            this.woodSpending += 5 * mult;
            this.oreSpending += mult;
            this.oxygenSpending += 1000 * mult;
            this.metalIncome += mult;
        }
    }
}
