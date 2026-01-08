import { game } from '../main';
import { intToString } from '../utils/utils';
import BaseView from './BaseView';
import UIEvents from './UIEvents';

export default class IceView extends BaseView {

    constructor() {
        super();
        if (game) {
            UIEvents.on(game.events, 'water:maxIndoor:updated', () => {
                this.updateFull();
            });
            UIEvents.on(game.events, 'ice:updated', () => UIEvents.notifyOnlyOnce(() => this.update(), this));
        }
    }

    public override updateFull() {
        if (!game) return;
        this.updateElementText('indoorWaterMax', intToString(game.water.maxIndoor));
        this.update();
    }

    override update() {
        if (!game) return;
        this.updateElementText('ice', intToString(game.ice.ice));
        this.updateElementText('buyableIce', intToString(game.ice.buyable));
        this.updateElementText('iceTransferred', intToString(game.ice.transferred, 4));
        this.updateElementText('indoorWaterReceived', intToString(Math.max(0, game.ice.transferred - game.water.excess), 4));
        this.updateElementText('iceBuyerAmount', intToString(game.ice.gain));

        this.updateElementText('indoorWater', intToString(game.water.indoor));
        this.updateElementText('indoorWaterSelling', intToString(game.water.selling));
        this.updateElementText('indoorWaterProfits', intToString(game.water.gain));
        this.updateElementText('excessWater', intToString(game.water.excess, 4));
    }
}
