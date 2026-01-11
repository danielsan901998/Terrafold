import { game } from '../main';
import { precision2, precision3 } from '../utils/utils';
import { Process } from './Process';

export default class Computer {
    unlocked: boolean;
    threads: number;
    freeThreads: number;
    speed: number;
    processes: Process[];
    cashSpending: number = 0;
    scienceSpending: number = 0;
    metalSpending: number = 0;
    woodSpending: number = 0;
    powerSpending: number = 0;

    static readonly UNLOCK_SCIENCE_COST = 1000;

    constructor() {
        this.unlocked = false;
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
                    game?.events.emit('computer:optimize-land:updated');
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
                    this.cost = (this.cost as number) + 0.5;
                    this.ticksNeeded += 50;
                },
                done: function () {
                    if (game && game.clouds.initialStormDuration >= 300) {
                        this.showing = false;
                        game.events.emit('computer:visibility:updated');
                        return true;
                    }
                    return false;
                },
                showing: true,
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
                showing: false,
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
                showing: false,
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
                showing: false,
            }),
            new Process({
                // Improve Ship engines
                text: "Improve Ship engines",
                tooltip: "Ship speed increases by 0.1 and empty ship speed by 0.01",
                ticksNeeded: 20000,
                cost: 10000,
                costType: "science",
                finish: function () {
                    if (game) game.spaceDock.improveEngines(0.1, 0.01);
                    this.cost = (this.cost as number) + 5000;
                    this.ticksNeeded += 1000;
                },
                done: function () {
                    if (game && game.spaceDock.defaultSpeed >= 1.0) {
                        this.showing = false;
                        game.events.emit('computer:visibility:updated');
                        return true;
                    }
                    return false;
                },
                showing: false,
            }),
        ];

        if (game) {
            game.events.on('computer:unlocked', () => {
                const robotProcs = ["Build Robots", "More Robot Storage", "Improve House Design"];
                if (game && game.robots.unlocked) {
                    this.processes.filter(p => robotProcs.includes(p.text)).forEach(p => p.showing = true);
                }
            });
            game.events.on('robots:unlocked', () => {
                const robotProcs = ["Build Robots", "More Robot Storage", "Improve House Design"];
                this.processes.filter(p => robotProcs.includes(p.text)).forEach(p => p.showing = true);
            });
            game.events.on('spaceDock:unlocked', () => {
                const proc = this.processes.find(p => p.text === "Improve Ship engines");
                if(proc) proc.showing = true;
            });
        }
    }

    tick() {
        this.cashSpending = 0;
        this.scienceSpending = 0;
        this.metalSpending = 0;
        this.woodSpending = 0;
        this.powerSpending = 0;
        for (let i = 0; i < this.processes.length; i++) {
            const process = this.processes[i]!;
            this.tickRow(process, this.speed * process.workers);
        }
    }

    tickRow(row: Process, ticksGained: number) {
        if (!game) return;
        if (ticksGained === 0) {
            row.isMoving = false;
            return;
        }

        if (row.done && row.done()) {
            row.isMoving = false;
            if (row.workers > 0) {
                this.freeThreads += row.workers;
                row.workers = 0;
            }
            game.events.emit('computer:threads:updated');
            return;
        }

        row.tick(ticksGained, 1, (type, amount) => {
            const category = (row.spendingCategory?.[type] || (type + "Spending")) as keyof Computer;
            if (this[category] !== undefined && typeof this[category] === 'number') {
                (this[category] as number) += amount;
            }
        });
    }

    unlockComputer() {
        if (!game) return;
        if (game.science >= Computer.UNLOCK_SCIENCE_COST) {
            game.science -= Computer.UNLOCK_SCIENCE_COST;
            this.unlocked = true;
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
            game.events.emit('computer:threads:updated');
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
            game.events.emit('computer:speed:updated');
        }
    }

    getSpeedCost() {
        return precision2(Math.pow(2, this.speed) * 500);
    }

    addThread(dataPos: number, numAdding: number) {
        numAdding = Math.min(numAdding, this.freeThreads);
        const proc = this.processes[dataPos];
        if (proc) {
            proc.workers += numAdding;
            this.freeThreads -= numAdding;
            game?.events.emit('computer:threads:updated');
        }
    }

    removeThread(dataPos: number, numRemoving: number) {
        const proc = this.processes[dataPos];
        if (proc) {
            numRemoving = Math.min(numRemoving, proc.workers);
            proc.workers -= numRemoving;
            this.freeThreads += numRemoving;
            game?.events.emit('computer:threads:updated');
        }
    }
}
