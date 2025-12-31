import { game } from '../main';
import Ship from './Ship';
import ShipManager from './ShipManager';

export default class Hangar {
    sendRate: number;
    timeRemaining: number;
    totalTime: number;
    y: number;

    constructor() {
        this.sendRate = 1;
        this.timeRemaining = this.totalTime = 40;
        this.y = (game?.canvasHeight || 600) * 0.85 - 25;
    }

    tick() {
        if (!game) return;
        this.y = game.canvasHeight * 0.85 - 25;
        this.timeRemaining--;
        if (this.timeRemaining < 0) {
            if (game.spaceDock.battleships > 0) {
                const tosend = Math.min(this.sendRate, game.spaceDock.battleships);
                const foodTaken = game.farms.food * .05; // Take 5% food per launch
                game.farms.food -= foodTaken;
                game.space.spawnShip(new Ship(tosend, foodTaken, ShipManager.foodPerShip), this.y);
                game.spaceDock.battleships -= tosend;
                game.spaceDock.sended += tosend;
                this.timeRemaining = this.totalTime;
            } else {
                this.timeRemaining = 0;
            }
        }
    }

    getTarget() {
        return {
            isHome: true,
            x: -125,
            y: this.y,
        }
    }
}