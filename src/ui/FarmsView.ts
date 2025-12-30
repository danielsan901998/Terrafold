import { game } from '../main';
import { intToString } from '../utils/utils';
import BaseView from './BaseView';

export default class FarmsView extends BaseView {


    update() {
        if (!game) return;
        this.updateElementText('farmsWater', intToString(game.farms.water));
        this.updateElementText('farms', intToString(game.farms.farms));
        this.updateElementText('food', intToString(game.farms.food));
        this.updateElementText('foodCreated', intToString(game.farms.foodCreated, 4));
        this.updateElementText('farmFoodEaten', intToString(game.population.foodEaten, 4));
        this.updateElementText('efficiency', intToString(game.farms.efficiency * 100, 1));
        this.updateElementText('farmWaterToLake', intToString(game.farms.transferred, 4));
        this.updateElementText('lakeWaterFromFarm', intToString(game.farms.transferred, 4));
    }
}
