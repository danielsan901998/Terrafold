import { game } from '../../main';
import { round1 } from '../utils';
import BaseView from './BaseView';

export default class HangarView extends BaseView {


    update() {
        if (!game) return;
        this.updateElementText("hangarSending", game.hangar.sendRate + " in " + round1(game.hangar.timeRemaining / 10) + " seconds.");
    }
}
