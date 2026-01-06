import { game } from '../main';
import { intToString } from '../utils/utils';
import BaseView from './BaseView';

export default class SpaceStationView extends BaseView {

    constructor() {
        super();
        if (game) {
            game.events.on('spaceStation:unlocked', () => this.checkUnlocked());
            game.events.on('spaceStation:updated', () => this.update());
        }
    }

    checkUnlocked() {
        if (!game) return;
        if (game.spaceStation.unlocked) {
            this.setVisible('spaceStationContainer', true);
            this.setVisible('unlockedSpaceStation', true);
            this.setVisible('unlockSpaceStation', false);
            this.setVisible('tractorBeamContainer', true);
        } else {
            this.setVisible('spaceStationContainer', false);
            this.setVisible('unlockedSpaceStation', false);
            this.setVisible('unlockSpaceStation', true);
            this.setVisible('tractorBeamContainer', false);
        }
    }

    public override updateFull() {
        if (!game) return;
        this.checkUnlocked();
        if (game.spaceStation.unlocked) {
            this.update();
        }
    }

    override update() {
        if (!game) return;
        let orbitString = "";
        let orbitSendString = "";
        for (let i = 0; i < game.spaceStation.orbiting.length; i++) {
            const resource = game.spaceStation.orbiting[i];
            if (!resource) continue;
            orbitString += intToString(resource.amount) + " " + resource.type;
            orbitSendString += intToString(resource.amount / 10000, 4) + " " + resource.type;
            if (i !== game.spaceStation.orbiting.length - 1) {
                orbitString += ", ";
                orbitSendString += ", ";
            }
        }
        this.updateElementText('orbitingResources', orbitString);
        this.updateElementText('orbitSending', orbitSendString);
    }
}
