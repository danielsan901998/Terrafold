import { view } from '../../main';

export default class SpaceDock {
    battleships: number;
    unlocked: number;
    sended: number;

    constructor() {
        this.battleships = 0;
        this.unlocked = 0;
        this.sended = 0;
    }

    addBattleship(amount: number) {
        this.battleships += amount;
        view?.updateSpaceDock();
    }
}