import { game } from '../main';
import { intToString, intToStringNegative } from '../utils/utils';
import BaseView from './BaseView';

export default class PopulationView extends BaseView {


    update() {
        if (!game) return;
        this.updateElementText('population', intToString(game.population.people));
        this.updateElementText('foodEaten', intToString(game.population.foodEaten, 4));
        this.updateElementText('populationGrowth', intToStringNegative(game.population.popGrowth, 4));
        this.updateElementText('starving', intToString(game.population.starving, 4));
        this.updateElementText('scienceDelta', intToString(game.population.scienceDelta, 4));
        this.updateElementText('cashDelta', intToString(game.population.cashDelta, 4));
        this.updateElementText('scienceRatio', game.population.scienceRatio < 50 ? 100 - game.population.scienceRatio + "% science" : game.population.scienceRatio + "% cash");

        this.updateElementText('happiness', intToString(game.population.happiness, 4));
        this.updateElementText('happinessFromHouse', intToString(game.population.houseBonus));
        this.updateElementText('happinessFromTrees', intToString(game.population.happinessFromTrees, 4));
        this.updateElementText('happinessFromOxygen', intToString(game.population.happinessFromOxygen, 4));
    }
}
