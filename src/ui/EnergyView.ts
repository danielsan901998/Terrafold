import { game } from '../main';
import { intToString } from '../utils/utils';
import BaseView from './BaseView';
import UIEvents from './UIEvents';
import Energy from '../core/Energy';

export default class EnergyView extends BaseView {

    constructor() {
        super();
        if (game) {
            UIEvents.on(game.events, 'energy:unlocked', () => this.updateFull());
            UIEvents.on(game.events, 'energy:battery:updated', () => this.updateFull());
            UIEvents.on(game.events, 'energy:updated', () => UIEvents.notifyOnlyOnce(() => this.update(), this));

            this.setupAmountCostListener('buyBattery', [
                { spanId: 'batteryOxygenCost', costPerUnit: Energy.BATTERY_OXYGEN_COST },
                { spanId: 'batteryScienceCost', costPerUnit: Energy.BATTERY_SCIENCE_COST }
            ]);
        }
    }

    checkUnlocked() {
        if (!game) return;
        this.updateElementText('unlockEnergyCost', intToString(Energy.UNLOCK_METAL_COST));
        if (game.energy.unlocked) {
            this.setVisible('unlockedEnergy', true);
            this.setVisible('unlockEnergy', false);
            if (this.getElement('spaceStationContainer').classList.contains("hidden")) {
                this.getElement('spaceStationContainer').classList.remove("hidden");
            }
        } else {
            this.setVisible('unlockedEnergy', false);
            this.setVisible('unlockEnergy', true);
            if (!this.getElement('spaceStationContainer').classList.contains("hidden")) {
                this.getElement('spaceStationContainer').classList.add("hidden");
            }
        }
    }

    override update() {
        if (!game) return;
        this.updateElementText('energy', intToString(game.power));
        this.updateElementText('energyProduction', intToString(game.energy.powerPerTick));
        this.updateElementText('drain', intToString(game.energy.drain));
    }

    override updateFull() {
        if (!game) return;
        this.checkUnlocked();
        if (game.energy.unlocked) {
            this.updateElementText('battery', intToString(game.energy.battery));

            const amount = this.getAmount('buyBattery');
            this.updateCostSpans(amount, [
                { spanId: 'batteryOxygenCost', costPerUnit: Energy.BATTERY_OXYGEN_COST },
                { spanId: 'batteryScienceCost', costPerUnit: Energy.BATTERY_SCIENCE_COST }
            ]);
        }
        this.update();
    }
}
