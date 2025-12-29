export default class Farms {
    constructor() {
        this.water = 0;
        this.farms = 0;
        this.food = 0;
        this.foodCreated = 0;
        this.efficiency = 1;
    }

    tick(gained) {
        this.water += gained;
        this.gainFood();
    }

    transferWater() {
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

    addFarm(amount) {
        this.farms += amount;
    }

    improve() {
        this.efficiency += .02;
    }
}
