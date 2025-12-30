export default class Land {
    land: number;
    baseLand: number;
    optimizedLand: number;
    water: number;
    soil: number;
    transferred: number;
    convertedLand: number = 0;

    constructor(totalLand: number) {
        this.land = totalLand;
        this.baseLand = totalLand;
        this.optimizedLand = totalLand;
        this.water = 0;
        this.soil = 0;
        this.transferred = 0;
    }

    tick(amount: number) {
        this.water += amount;
        this.turnLandToSoil();
    }

    turnLandToSoil() {
        this.convertedLand = this.water / 1000;
        if (this.land < this.convertedLand) {
            this.convertedLand = this.land;
        }
        this.land -= this.convertedLand;
        this.soil += this.convertedLand;
        this.water -= this.convertedLand;
    }

    transferWater(): number {
        this.transferred = this.water / 1000;
        this.water -= this.transferred;
        return this.transferred;
    }

    improveLand() {
        const amount = (10 * this.baseLand - this.optimizedLand) / 100;
        this.optimizedLand += amount;
        this.land += amount;
    }

    addLand(amount: number) {
        this.optimizedLand += amount;
        this.land += amount;
        this.baseLand += amount;
    }
}