import { view } from '../../main.js';

export default class SpaceDock {
    constructor() {
        this.battleships = 0;
        this.unlocked = 0;
        this.sended = 0;
    }

    addBattleship(amount) {
        this.battleships += amount;
        view.updateSpaceDock();
    }
}
