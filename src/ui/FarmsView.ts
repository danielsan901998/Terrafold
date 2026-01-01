import { game } from '../main';
import { intToString } from '../utils/utils';
import BaseView from './BaseView';

export default class FarmsView extends BaseView {


    constructor() {
        super();
        if (game) {
            game.events.on('farms:updated', () => this.updateFull());
            const el = document.getElementById('buyFarmAmount');
            if (el) el.addEventListener('input', () => this.updateFull());
        }
    }

    update() {
        if (!game) return;
        this.updateElementText('farmsWater', intToString(game.farms.water));
        this.updateElementText('food', intToString(game.farms.food));
        this.updateElementText('foodCreated', intToString(game.farms.foodCreated, 4));
        this.updateElementText('farmFoodEaten', intToString(game.population.foodEaten, 4));
        this.updateElementText('farmWaterToLake', intToString(game.farms.transferred, 4));
        this.updateElementText('lakeWaterFromFarm', intToString(game.farms.transferred, 4));
    }

    updateFull() {
        if (!game) return;
        this.updateElementText('farms', intToString(game.farms.farms));
        this.updateElementText('efficiency', intToString(game.farms.efficiency * 100));
        const el = document.getElementById('buyFarmAmount') as HTMLInputElement;
        const amount = el ? Number(el.value) : 1;
        this.updateElementText('farmCost', intToString(amount * 50));
        this.update();
    }
}
