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
    }
}
