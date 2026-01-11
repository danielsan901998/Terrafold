import { game } from '../main';
import { intToString } from '../utils/utils';
import BaseView from './BaseView';
import UIEvents from './UIEvents';
import SpaceDock from '../core/SpaceDock';

export default class SpaceDockView extends BaseView {

    constructor() {
        super();
        if (game) {
            UIEvents.on(game.events, 'spaceDock:unlocked', () => this.checkUnlocked());
            UIEvents.on(game.events, 'spaceDock:updated', () => UIEvents.notifyOnlyOnce(() => this.update(), this));

            this.setupAmountCostListener('buyBattleshipAmount', [
                { spanId: 'battleshipOxygenCost', costPerUnit: SpaceDock.BATTLESHIP_OXYGEN_COST },
                { spanId: 'battleshipScienceCost', costPerUnit: SpaceDock.BATTLESHIP_SCIENCE_COST }
            ]);
        }
    }

    checkUnlocked() {
        if (!game) return;
        if (game.spaceDock.unlocked) {
            this.setVisible('spaceDockContainer', true);
            this.setVisible('hangarContainer', true);
            this.setVisible('spaceCanvas', true);
            this.setVisible('spaceContainer', true);
            this.update();
        } else {
            this.setVisible('spaceDockContainer', false);
            this.setVisible('hangarContainer', false);
            this.setVisible('spaceCanvas', false);
            this.setVisible('spaceContainer', false);
        }
    }

    public override updateFull() {
        if (!game) return;
        this.checkUnlocked();
        if (game.spaceDock.unlocked) {
            this.update();
        }
    }

    override update() {
        if (!game) return;
        this.updateElementText('battleships', intToString(game.spaceDock.battleships));
        this.updateElementText('totalBattleships', intToString(game.spaceDock.battleships + game.spaceDock.sended));

        const amount = this.getAmount('buyBattleshipAmount');
        this.updateCostSpans(amount, [
            { spanId: 'battleshipOxygenCost', costPerUnit: SpaceDock.BATTLESHIP_OXYGEN_COST },
            { spanId: 'battleshipScienceCost', costPerUnit: SpaceDock.BATTLESHIP_SCIENCE_COST }
        ]);
    }
}
