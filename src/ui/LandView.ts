import { game } from '../main';
import { intToString } from '../utils/utils';
import BaseView from './BaseView';

export default class LandView extends BaseView {


    update() {
        if (!game) return;
        this.updateElementText('landWater', intToString(game.land.water));
        this.updateElementText('optimizedLand', intToString(game.land.optimizedLand));
        this.updateElementText('baseLand', intToString(game.land.baseLand));
        this.updateElementText('land', intToString(game.land.land));
        this.updateElementText('soil', intToString(game.land.soil));
        this.updateElementText('landConverted', intToString(game.land.convertedLand, 4));
        this.updateElementText('landWaterToForest', intToString(game.land.transferred, 4));
        this.updateElementText('forestReceived', intToString(game.land.transferred, 4));
        this.updateElementText('landWaterToFarm', intToString(game.land.transferred, 4));
        this.updateElementText('farmReceived', intToString(game.land.transferred, 4));
    }
}
