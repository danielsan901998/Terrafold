import { game } from '../../main';

export default class City {
    people: number;
    foodEaten: number;
    popGrowth: number;
    starving: number;
    scienceRatio: number;
    scienceDelta: number;
    cashDelta: number;
    happiness: number;
    houseBonus: number;
    happinessFromTrees: number = 0;
    happinessFromOxygen: number = 0;

    constructor() {
        this.people = 0;
        this.foodEaten = 0;
        this.popGrowth = 0;
        this.starving = 0;
        this.scienceRatio = 0;
        this.scienceDelta = 0;
        this.cashDelta = 0;
        this.happiness = 1;
        this.houseBonus = 1;
    }

    tick() {
        if (!game) return;
        this.foodEaten = this.people / 100;
        if (this.foodEaten > game.farms.food) {
            this.starving = this.foodEaten - game.farms.food;
            this.foodEaten = game.farms.food;
        } else {
            this.starving = 0;
        }
        game.farms.food -= this.foodEaten;
        this.popGrowth = (game.farms.food - this.people) / 1000 - this.starving / 100;
        this.people += this.popGrowth;
        this.updateHappiness();
        this.tickRatio();
    }

    updateHappiness() {
        if (!game) return;
        this.happinessFromTrees = Math.log10((game.trees.trees + 1)) / 10;
        this.happinessFromOxygen = Math.log10((game.oxygen + 1)) / 20;
        this.happiness = this.houseBonus * (1 + this.happinessFromTrees + this.happinessFromOxygen);
    }

    tickRatio() {
        if (!game) return;
        this.scienceDelta = this.people / 100 * (100 - this.scienceRatio) / 100 * this.happiness;
        this.cashDelta = this.people / 100 * this.scienceRatio / 100 * this.happiness;
        game.science += this.scienceDelta;
        game.cash += this.cashDelta;
    }

    improveHouse() {
        this.houseBonus += .1;
    }
}
