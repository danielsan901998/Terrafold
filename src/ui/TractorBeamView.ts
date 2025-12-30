import { game, view } from '../main';
import { intToString } from '../utils/utils';
import BaseView from './BaseView';

export default class TractorBeamView extends BaseView {

    constructor() {
        super();
        if (game) {
            game.events.on('tractorBeam:unlocked', () => this.checkUnlocked());
            game.events.on('tractorBeam:updated', () => this.update());
            game.events.on('tractorBeam:removeComet', (comet: any) => {
                if (view) view.removeComet(comet);
            });
        }
    }

    checkUnlocked() {
        if (!game) return;
        if (game.spaceStation.unlocked) {
            this.getElement('tractorBeamContainer').style.display = "inline-block";
        } else {
            this.getElement('tractorBeamContainer').style.display = "none";
        }

        if (game.tractorBeam.unlocked) {
            this.getElement('unlockedTractorBeam').style.display = "inline-block";
            this.getElement('unlockTractorBeam').style.display = "none";
        } else {
            this.getElement('unlockedTractorBeam').style.display = "none";
            this.getElement('unlockTractorBeam').style.display = "inline-block";
        }
    }

    update() {
        if (!game || !view) return;
        const container = this.getElement("allPassing");
        let text = "";
        const comets = game.tractorBeam.comets;
        for (let i = 0; i < comets.length; i++) {
            const comet = comets[i];
            if (!comet) continue;
            text += comet.name + " with " +
                intToString(comet.amount, 1) +
                " " + comet.amountType +
                " passing in " + comet.duration + "<br>";
            view.drawComet(comet);
        }
        if (this.textCache.get("allPassing") !== text) {
            container.innerHTML = text;
            this.textCache.set("allPassing", text);
        }
        this.updateElementText('takeAmount', game.tractorBeam.takeAmount);
    }
}
