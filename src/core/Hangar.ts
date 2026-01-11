import { game } from '../main';
import Ship from './Ship';
import ShipManager from './ShipManager';

export default class Hangar {
    sendRate: number;
    timeRemaining: number;
    totalTime: number;
    y: number;
    maxMines: number;

    static readonly METAL_COST_PER_RATE = 1000000;

    constructor() {
        this.sendRate = 1;
        this.timeRemaining = this.totalTime = 40;
        this.y = (game?.canvasHeight || 600) * 0.5 - 25;
        this.maxMines = 10;
    }

    tick() {
        if (!game) return;
        this.y = game.canvasHeight * 0.5 - 25;
        this.timeRemaining--;
        if (this.timeRemaining < 0) {
            if (game.spaceDock.battleships > 0 && !game.space.allEmpty) {
                const tosend = Math.min(this.sendRate, game.spaceDock.battleships);
                const foodTaken = game.farms.food * .05; // Take 5% food per launch
                game.farms.food -= foodTaken;
                const newShip = new Ship(tosend, foodTaken, ShipManager.foodPerShip);
                newShip.targetIndex = ShipManager.globalTargetIndex;
                game.space.spawnShip(newShip, this.y);
                game.spaceDock.battleships -= tosend;
                game.spaceDock.sended += tosend;
                game.events.emit('spaceDock:updated');
                this.timeRemaining = this.totalTime;
            } else {
                this.timeRemaining = 0;
            }
        }
    }

    getTarget() {
        return {
            isHome: true as const,
            x: -125,
            y: this.y,
        }
    }
}