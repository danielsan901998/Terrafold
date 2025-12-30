import { game } from '../main';
import { intToString } from '../utils/utils';
import BaseView from './BaseView';

export default class IceView extends BaseView {


    update() {
        if (!game) return;
        this.updateElementText('ice', intToString(game.ice.ice));
        this.updateElementText('buyableIce', intToString(game.ice.buyable));
        this.updateElementText('iceTransferred', intToString(game.ice.transferred, 4));
        this.updateElementText('indoorWaterReceived', intToString(game.ice.transferred, 4));
        this.updateElementText('iceBuyerAmount', String(game.ice.gain));
    }
}
