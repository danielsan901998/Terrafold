import { game } from '../../main';
import { intToString } from '../utils';
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
        if (game.energy.unlocked) {
            this.getElement('spaceStationContainer').style.display = "inline-block";
        } else {
            this.getElement('spaceStationContainer').style.display = "none";
        }

        if (game.spaceStation.unlocked) {
            this.getElement('unlockedSpaceStation').style.display = "inline-block";
            this.getElement('unlockSpaceStation').style.display = "none";
        } else {
            this.getElement('unlockedSpaceStation').style.display = "none";
            this.getElement('unlockSpaceStation').style.display = "inline-block";
        }
    }

    update() {
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
