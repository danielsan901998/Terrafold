import { game } from '../main';
import { intToString, intToStringNegative } from '../utils/utils';
import BaseView from './BaseView';

export default class ResourceView extends BaseView {

    update() {
        if (!game) return;
        this.updateElementText('totalWater', intToString(game.ice.ice + game.water.indoor + game.water.outdoor + game.clouds.water + game.land.water + game.trees.water + game.farms.water));
        this.updateElementText('waterIncome', intToString(game.spaceStation.waterIncome, 4));
        this.updateElementText('waterBought', intToString(game.ice.buyIncome, 4));
        this.updateElementText('waterSpending', intToString(game.water.waterSpending, 4));
        this.updateElementText('waterFarms', intToString(game.farms.waterSpending, 4));
        this.updateElementText('waterTrees', intToString(game.trees.waterSpending, 4));
        this.updateElementText('waterNet', intToStringNegative(game.spaceStation.waterIncome + game.ice.buyIncome - game.water.waterSpending - game.farms.waterSpending - game.trees.waterSpending, 4));

        this.updateElementText('cash', intToString(game.cash));
        this.updateElementText('cashIncome', intToString(game.population.cashDelta + game.water.gain, 4));
        this.updateElementText('cashFromPeople', intToString(game.population.cashDelta, 4));
        this.updateElementText('cashFromWater', intToString(game.water.gain, 4));
        this.updateElementText('cashComputer', intToString(game.computer.cashSpending, 4));
        this.updateElementText('cashNet', intToStringNegative(game.population.cashDelta + game.water.gain - game.computer.cashSpending, 4));

        this.updateElementText('oxygen', intToString(game.oxygen));
        this.updateElementText('oxygenIncome', intToString(game.trees.oxygenGain, 4));
        this.updateElementText('oxygenLeak', intToString(game.oxygenLeak, 4));
        this.updateElementText('oxygenSmelting', intToString(game.robots.oxygenSpending, 4));
        this.updateElementText('oxygenNet', intToStringNegative(game.trees.oxygenGain - game.oxygenLeak - game.robots.oxygenSpending, 4));

        this.updateElementText('science', intToString(game.science));
        this.updateElementText('scienceIncome', intToString(game.population.scienceDelta, 4));
        this.updateElementText('scienceComputer', intToString(game.computer.scienceSpending, 4));
        this.updateElementText('scienceNet', intToStringNegative(game.population.scienceDelta - game.computer.scienceSpending, 4));

        this.updateElementText('wood', intToString(game.wood));
        this.updateElementText('woodIncome', intToString(game.robots.woodIncome, 4));
        this.updateElementText('woodSpending', intToString(game.robots.woodSpending, 4));
        this.updateElementText('woodComputer', intToString(game.computer.woodSpending, 4));
        this.updateElementText('woodNet', intToStringNegative(game.robots.woodIncome - game.robots.woodSpending - game.computer.woodSpending, 4));

        this.updateElementText('metal', intToString(game.metal));
        this.updateElementText('metalIncome', intToString(game.robots.metalIncome, 4));
        this.updateElementText('metalSpending', intToString(game.robots.metalSpending, 4));
        this.updateElementText('metalComputer', intToString(game.computer.metalSpending, 4));
        this.updateElementText('metalNet', intToStringNegative(game.robots.metalIncome - game.robots.metalSpending - game.computer.metalSpending, 4));

        this.updateElementText('ore', intToString(game.ore));
        this.updateElementText('oreIncome', intToString(game.robots.oreIncome, 4));
        this.updateElementText('oreSpending', intToString(game.robots.oreSpending, 4));
        this.updateElementText('oreNet', intToStringNegative(game.robots.oreIncome - game.robots.oreSpending, 4));
    }
}
