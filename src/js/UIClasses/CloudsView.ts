import { game } from '../../main';
import { intToString } from '../utils';
import BaseView from './BaseView';

export default class CloudsView extends BaseView {


    update() {
        if (!game) return;
        this.updateElementText('clouds', intToString(game.clouds.water));
        this.updateElementText('stormTimer', game.clouds.stormTimer);
        this.updateElementText('stormRate', game.clouds.stormRate + "%");
        this.getElement('intensityPB').style.height = game.clouds.stormRate + "%";
        this.updateElementText('stormDuration', game.clouds.stormDuration);
        this.updateElementText('rain', intToString(game.clouds.transferred, 4));
        this.updateElementText('landReceived', intToString(game.clouds.transferred, 4));
        this.updateElementText('lightningChance', intToString(game.clouds.lightningChance));
        this.updateElementText('lightningStrength', intToString(game.clouds.lightningStrength));
    }
}
