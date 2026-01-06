import { game } from '../main';

export default class Clouds {
    water: number;
    initialStormTimer: number;
    stormTimer: number;
    stormRate: number; // climbs to 100, stays for stormDuration, falls to 0
    storming: number;
    initialStormDuration: number;
    stormDuration: number;
    transferred: number;
    lightningChance: number;
    lightningStrength: number;

    constructor() {
        this.water = 0;
        this.initialStormTimer = 300;
        this.stormTimer = 300;
        this.stormRate = 0; 
        this.storming = 0;
        this.initialStormDuration = 60;
        this.stormDuration = 60;
        this.transferred = 0;
        this.lightningChance = 0;
        this.lightningStrength = 0;
    }

    tick(gained: number) {
        this.water += gained;
        this.nextStormTimer();
        this.tickLightning();
    }

    tickLightning() {
        this.lightningChance += .01 * this.stormRate / 100;
        this.lightningStrength = this.water * .01;
        if (this.stormRate === 100 && this.lightningChance > Math.random() * 100) {
            this.lightningChance = 0;
            if (game) game.energy.gainEnergy(this.lightningStrength);
        }
    }

    transferWater(): number {
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

    gainStormDuration(amount: number) {
        this.stormDuration += amount;
        this.initialStormDuration += amount;
        game?.events.emit('clouds:stormDuration:updated');
    }
}