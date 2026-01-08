import { game } from '../main';
import { intToString } from '../utils/utils';
import BaseView from './BaseView';
import UIEvents from './UIEvents';

export default class TreesView extends BaseView {

    constructor() {
        super();
        if (game) {
            UIEvents.on(game.events, 'trees:updated', () => UIEvents.notifyOnlyOnce(() => this.update(), this));
        }
    }

    override update() {
        if (!game) return;
        this.updateElementText('forestWater', intToString(game.trees.water));
        this.updateElementText('ferns', intToString(game.trees.ferns));
        this.updateElementText('fernsDelta', intToString(game.trees.fernsDelta, 4));
        this.updateElementText('smallTrees', intToString(game.trees.smallTrees));
        this.updateElementText('smallTreesDelta', intToString(game.trees.smallTreesDelta, 4));
        this.updateElementText('trees', intToString(game.trees.trees));
        this.updateElementText('treesDelta', intToString(game.trees.treesDelta, 4));
        this.updateElementText('totalPlants', intToString(game.trees.totalPlants));
        this.updateElementText('oxygenGain', intToString(game.trees.oxygenGain, 4));
        this.updateElementText('forestWaterToLake', intToString(game.trees.transferred, 4));
        this.updateElementText('lakeWaterFromForest', intToString(game.trees.transferred, 4));
        this.updateElementText('fernWater', intToString(game.trees.fernsWaterUse, 4));
        this.updateElementText('smallTreesWater', intToString(game.trees.smallTreesWaterUse, 4));
        this.updateElementText('treesWater', intToString(game.trees.treesWaterUse, 4));
    }
}
