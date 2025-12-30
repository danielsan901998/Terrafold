import { game } from '../main';
import { intToString } from '../utils/utils';
import BaseView from './BaseView';

export default class WaterView extends BaseView {


    update() {
        if (!game) return;
        this.updateElementText('indoorWater', intToString(game.water.indoor));
        this.updateElementText('indoorWaterMax', intToString(game.water.maxIndoor));
        this.updateElementText('indoorWaterSelling', intToString(game.water.selling));
        this.updateElementText('indoorWaterProfits', intToString(game.water.gain));
        this.updateElementText('excessWater', intToString(game.water.excess, 4));
        this.updateElementText('lakeWaterFromStorage', intToString(game.water.excess, 4));

        this.updateElementText('outdoorWater', intToString(game.water.outdoor));
        this.updateElementText('waterTransferred', intToString(game.water.transferred, 4));
        this.updateElementText('cloudsReceived', intToString(game.water.transferred, 4));
    }
}
