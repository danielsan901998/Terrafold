import { game } from '../main';
import { intToString } from '../utils/utils';
import BaseView from './BaseView';
import UIEvents from './UIEvents';
import DysonSwarm from '../core/DysonSwarm';

export default class DysonSwarmView extends BaseView {

    constructor() {
        super();
        if (game) {
            UIEvents.on(game.events, 'dysonSwarm:unlocked', () => this.checkUnlocked());
            UIEvents.on(game.events, 'dysonSwarm:updated', () => UIEvents.notifyOnlyOnce(() => this.update(), this));
            
            const btnUnlock = document.getElementById('unlockDysonSwarm');
            if (btnUnlock) {
                btnUnlock.onclick = () => {
                    game?.dysonSwarm.unlockDysonSwarm();
                };
            }

            const btnBuy = document.getElementById('btnBuySatellite');
            if (btnBuy) {
                btnBuy.onclick = () => {
                    const input = document.getElementById('buySatelliteAmount') as HTMLInputElement;
                    const amount = parseInt(input.value) || 0;
                    game?.dysonSwarm.buySatellites(amount);
                };
            }
        }
    }

    checkUnlocked() {
        if (!game) return;
        if (game.spaceDock.unlocked) {
            this.setVisible('dysonSwarmContainer', true);
        }

        if (game.dysonSwarm.unlocked) {
            this.setVisible('unlockedDysonSwarm', true);
            this.setVisible('unlockDysonSwarm', false);
        } else {
            this.setVisible('unlockedDysonSwarm', false);
            this.setVisible('unlockDysonSwarm', true);
        }
    }

    public override updateFull() {
        if (!game) return;
        this.checkUnlocked();
        if (game.dysonSwarm.unlocked) {
            this.update();
        }
    }

    override update() {
        if (!game) return;
        this.updateElementText('satellites', intToString(game.dysonSwarm.satellites));
        this.updateElementText('dysonPower', intToString(game.dysonSwarm.getPowerProduction()) + " / tick");
        
        const satelliteCost = `Metal: ${intToString(DysonSwarm.SATELLITE_METAL_COST)}, Sci: ${intToString(DysonSwarm.SATELLITE_SCIENCE_COST)}`;
        this.updateElementText('satelliteCost', satelliteCost);
    }
}
