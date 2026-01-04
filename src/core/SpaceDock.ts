import { game } from '../main';

export default class SpaceDock {
    battleships: number;
    unlocked: number;
    sended: number;
    defaultSpeed: number = 0.5;
    emptySpeed: number = 0.05;

    constructor() {
        this.battleships = 0;
        this.unlocked = 0;
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