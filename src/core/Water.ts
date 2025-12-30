import { game } from '../main';

export default class Water {
    indoor: number;
    outdoor: number;
    maxIndoor: number;
    selling: number;
    excess: number;
    gain: number;
    transferred: number = 0;

    constructor() {
        this.indoor = 0;
        this.outdoor = 0;
        this.maxIndoor = 50;
        this.selling = 0;
        this.excess = 0;
        this.gain = 0;
    }

    tick(gained: number) {
        this.indoor += gained;

        this.excess = this.indoor - this.maxIndoor;
        if (this.excess > 0) {
            this.indoor = this.maxIndoor;
            this.outdoor += this.excess;
        } else {
            this.excess = 0;
        }

        this.selling = this.indoor / 100;
        this.indoor -= this.selling;
        this.gain = this.selling * 2;
        if (game) game.cash += this.gain;
    }

    transferWater(): number {
        this.transferred = this.outdoor / 1000;
        this.outdoor -= this.transferred;
        return this.transferred;
    }

    sellWater(toSell: number) {
        if (this.indoor < toSell) {
            toSell = this.indoor;
        }
        this.indoor -= toSell;
        if (game) game.cash += this.getPrice(toSell);
    }

    getPrice(toSell: number): number {
        return toSell * 2;
    }
}
