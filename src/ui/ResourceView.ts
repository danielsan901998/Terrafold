import { game } from '../main';
import { intToString } from '../utils/utils';
import BaseView from './BaseView';

export default class ResourceView extends BaseView {


    update() {
        if (!game) return;
        this.updateElementText('totalWater', intToString(game.ice.ice + game.water.indoor + game.water.outdoor + game.clouds.water + game.land.water + game.trees.water + game.farms.water));
        this.updateElementText('cash', intToString(game.cash));
        this.updateElementText('oxygen', intToString(game.oxygen));
        this.updateElementText('science', intToString(game.science));
        this.updateElementText('wood', intToString(game.wood));
        this.updateElementText('metal', intToString(game.metal));
        this.updateElementText('oxygenLeak', intToString(game.oxygenLeak, 4));
    }
}
