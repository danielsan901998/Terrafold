import { game } from '../../main.js';

export default class Clouds {
    constructor() {
        this.water = 0;
        this.initialStormTimer = 300;
        this.stormTimer = 300;
        this.stormRate = 0; //climbs to 100, stays for stormDuration, falls to 0
        this.storming = 0;
        this.initialStormDuration = 60;
        this.stormDuration = 60;
        this.transferred = 0;
        this.lightningChance = 0;
        this.lightningStrength = 0;
    }

    tick(gained) {
        this.water += gained;
        this.nextStormTimer();
        return this.tickLightning();
    }

    tickLightning() {
        this.lightningChance += .01 * this.stormRate / 100;
        this.lightningStrength = this.water * .01;
        if (this.stormRate === 100 && this.lightningChance > Math.random() * 100) {
            this.lightningChance = 0;
            game.energy.gainEnergy(this.lightningStrength);
        }
    }

    transferWater() {
        this.transferred = this.water / 500 * this.stormRate / 100;
        this.water -= this.transferred;
        return this.transferred;
    }

    nextStormTimer() {
        if (this.stormTimer > 0) {
            this.stormTimer--;
        } else if (this.stormDuration > 0) {
            this.storming = 1;
        }

        if (this.stormRate >= 100) {
            this.storming = 0;
            if (this.stormDuration > 0) {
                this.storming = 0;
                this.stormDuration--;
            } else {
                this.storming = -1;
            }
        } else if (this.stormRate <= 0 && this.storming === -1) {
            this.stormDuration = this.initialStormDuration;
            this.stormTimer = this.initialStormTimer;
            this.storming = 0;
        }

        this.stormRate += this.storming;
    }

    gainStormDuration(amount) {
        this.stormDuration += amount;
        this.initialStormDuration += amount;
    }
}
