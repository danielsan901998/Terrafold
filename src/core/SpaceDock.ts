import { game } from '../main';

export default class SpaceDock {
    battleships: number;
    unlocked: boolean;
    sended: number;
    defaultSpeed: number = 0.5;
    emptySpeed: number = 0.05;

    static readonly BATTLESHIP_OXYGEN_COST = 3e7;
    static readonly BATTLESHIP_SCIENCE_COST = 1.5e7;

    constructor() {
        this.battleships = 0;
        this.unlocked = false;
        this.sended = 0;
    }

    addBattleship(amount: number) {
        this.battleships += amount;
        game?.events.emit('spaceDock:updated');
    }

    improveEngines(speedGain: number, emptySpeedGain: number) {
        this.defaultSpeed += speedGain;
        this.emptySpeed += emptySpeedGain;
        game?.events.emit('spaceDock:updated');
    }
}