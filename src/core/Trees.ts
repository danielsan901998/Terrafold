import { game } from '../main';

export default class Trees {
    water: number;
    ferns: number;
    fernsDelta: number;
    fernsWaterUse: number;
    smallTrees: number;
    smallTreesDelta: number;
    smallTreesWaterUse: number;
    trees: number;
    treesDelta: number;
    treesWaterUse: number;
    totalPlants: number;
    oxygenGain: number;
    woodIncome: number = 0;
    woodSpending: number = 0;
    waterSpending: number = 0;
    transferred: number = 0;

    constructor() {
        this.water = 0;
        this.ferns = 0;
        this.fernsDelta = 0;
        this.fernsWaterUse = 0;
        this.smallTrees = 0;
        this.smallTreesDelta = 0;
        this.smallTreesWaterUse = 0;
        this.trees = 0;
        this.treesDelta = 0;
        this.treesWaterUse = 0;
        this.totalPlants = 0;
        this.oxygenGain = 0;
    }

    tick(amount: number) {
        if (!game) return;
        this.transferred = 0;
        this.oxygenGain = 0;
        this.woodIncome = 0;
        this.woodSpending = 0;
        this.waterSpending = 0;
        this.water += amount;
        this.plantGrowth();
        this.oxygenGain = (this.ferns / 1000) + (3 * this.smallTrees / 1000) + (this.trees / 100);
        game.oxygen += this.oxygenGain;
        game.events.emit('trees:updated');
    }

    plantGrowth() {
        if (!game) return;
        this.totalPlants = this.ferns + this.smallTrees + this.trees;
        this.treesDelta = this.smallTrees / 1000;
        this.smallTreesDelta = this.ferns / 1000 - this.treesDelta;
        this.fernsDelta = (game.land.soil - this.totalPlants) / 1000 - this.ferns / 1000;

        this.fernsWaterUse = (game.land.soil - this.totalPlants) / 1000;
        this.fernsWaterUse = this.fernsWaterUse < 0 ? 0 : this.fernsWaterUse;
        this.smallTreesWaterUse = this.ferns / 1000;
        this.treesWaterUse = this.smallTrees / 1000;

        if (this.fernsDelta < 0) {
            let excessDying = 0;
            if (this.ferns + this.fernsDelta < 0) { // Not enough ferns to kill off
                excessDying = this.fernsDelta + this.ferns;
                this.fernsDelta = -1 * this.ferns;
            }
            this.smallTreesDelta += excessDying;
            excessDying = 0;
            if (this.smallTrees + this.smallTreesDelta < 0) { // Not enough small trees to kill off
                excessDying = this.smallTrees + this.smallTreesDelta;
                this.smallTreesDelta = -1 * this.smallTrees;
            }
            this.treesDelta += excessDying;
        }
        if (this.water < this.treesWaterUse) {
            this.treesDelta = this.treesDelta > 0 ? this.water : this.treesDelta;
            this.treesWaterUse = this.water;
        }
        this.trees += this.treesDelta;
        this.water -= this.treesWaterUse;
        this.waterSpending += this.treesWaterUse;

        if (this.water < this.smallTreesWaterUse) {
            this.smallTreesDelta = this.smallTreesDelta > 0 ? this.water : this.smallTreesDelta;
            this.smallTreesWaterUse = this.water;
        }
        this.smallTrees += this.smallTreesDelta;
        this.water -= this.smallTreesWaterUse;
        this.waterSpending += this.smallTreesWaterUse;

        if (this.water < this.fernsWaterUse) {
            this.fernsDelta = this.fernsDelta > 0 ? this.water : this.fernsDelta;
            this.fernsWaterUse = this.water;
        }
        this.ferns += this.fernsDelta;
        this.water -= this.fernsWaterUse;
        this.waterSpending += this.fernsWaterUse;
    }

    transferWater(): number {
        this.transferred = this.water / 1000;
        this.water -= this.transferred;
        return this.transferred;
    }
}
