import { game } from '../main';

export default class Farms {
    water: number;
    farms: number;
    food: number;
    foodCreated: number;
    efficiency: number;
    farmRatio: number;
    waterSpending: number = 0;
    transferred: number = 0;

    constructor() {
        this.water = 0;
        this.farms = 0;
        this.food = 0;
        this.foodCreated = 0;
        this.efficiency = 1;
        this.farmRatio = 0;
    }

    tick(amount: number) {
        this.transferred = 0;
        this.foodCreated = 0;
        this.waterSpending = 0;
        this.water += amount;
        this.gainFood();
        game?.events.emit('farms:updated');
    }

    transferWater(): number {
        this.transferred = this.water / 1000;
        this.water -= this.transferred;
        return this.transferred;
    }

    gainFood() {
        this.foodCreated = this.farms / 100 * this.efficiency;
        if (this.foodCreated > this.water) {
            this.foodCreated = this.water;
        }
        this.waterSpending += this.foodCreated;
        this.water -= this.foodCreated;
        this.food += this.foodCreated;
    }

    addFarm(amount: number) {
        this.farms += amount;
        game?.events.emit('farms:updated');
    }

    updateFarms(soil: number): number {
        const totalPotentialSoil = soil + (this.farms * 50);
        const desiredFarms = Math.floor((totalPotentialSoil * this.farmRatio / 100) / 50);
        const diff = desiredFarms - this.farms;
        if (diff !== 0) {
            this.farms = desiredFarms;
            game?.events.emit('farms:updated');
            return diff * 50;
        }
        return 0;
    }

    improve() {
        this.efficiency += .02;
        game?.events.emit('farms:updated');
    }
}