export default class Ice {
    ice: number;
    buyable: number;
    gain: number;
    max: number;
    transferred: number;
    buyIncome: number = 0;

    constructor() {
        this.ice = 0;
        this.buyable = 1000;
        this.gain = 10;
        this.max = 1000;
        this.transferred = 0;
    }

    tick() {
        this.buyIncome = 0;
        this.buyable += this.gain;
        if (this.buyable > this.max) {
            this.buyable = this.max;
        }
    }

    transferWater(): number {
        this.transferred = this.ice / 1000;
        this.ice -= this.transferred;
        return this.transferred;
    }

    buyIce(toBuy: number): number {
        if (this.buyable < toBuy) {
            toBuy = this.buyable;
        }
        this.buyable -= toBuy;
        this.ice += toBuy;
        this.buyIncome += toBuy;
        return toBuy;
    }

    findIceSeller(amount: number) {
        this.max += amount * 200;
        this.gain += amount;
    }
}