import { game } from '../main';

export default class Farms {
    water: number;
    farms: number;
    food: number;
    foodCreated: number;
    efficiency: number;
    transferred: number = 0;

    constructor() {
        this.water = 0;
        this.farms = 0;
        this.food = 0;
        this.foodCreated = 0;
        this.efficiency = 1;
    }

    tick(gained: number) {
        this.water += gained;
        this.gainFood();
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
        this.water -= this.foodCreated;
        this.food += this.foodCreated;
    }

    addFarm(amount: number) {
        this.farms += amount;
        game?.events.emit('farms:updated');
    }

    improve() {
        this.efficiency += .02;
        game?.events.emit('farms:updated');
    }
}