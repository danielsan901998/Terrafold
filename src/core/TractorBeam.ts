import { game, incrementCometId } from '../main';
import { Comet, OrbitingResource } from '../types';

export default class TractorBeam {
    unlocked: number;
    cometSpotChance: number;
    takeAmount: OrbitingResource[];
    comets: Comet[];

    constructor() {
        this.unlocked = 0;
        this.cometSpotChance = 0.006;
        this.takeAmount = [
            { type: "ice", amount: 0 },
            { type: "dirt", amount: 0 }
        ];
        this.comets = [];
    }


    tick() {
        if (!this.unlocked || !game) {
            return;
        }
        this.checkForNewAsteroids();

        if (this.comets.length) {
            const transferred = game.power / 1000;
            game.power -= this.pullIntoOrbit(transferred);
            this.removeAsteroidIfDone();
        }
    }

    unlockTractorBeam() {
        if (!game) return;
        if (game.science >= 5e5 && game.oxygen >= 5e6) {
            game.science -= 5e5;
            game.oxygen -= 2e6;
            this.unlocked = 1;
            game.events.emit('tractorBeam:unlocked');
            game.spaceDock.unlocked = 1;
            game.events.emit('spaceDock:unlocked');
        }
        game.events.emit('tractorBeam:updated');
    }

    pullIntoOrbit(energy: number): number {
        if (!game) return 0;
        const maxtaken = energy / this.comets.length;
        let used = 0;
        for (let j = 0; j < game.spaceStation.orbiting.length; j++) {
            const orbiting = game.spaceStation.orbiting[j]!;
            let totalAmount = 0;
            for (let i = 0; i < this.comets.length; i++) {
                const comet = this.comets[i]!;
                if (comet.amountType === orbiting.type) {
                    const taken = Math.min(maxtaken, comet.amount);
                    used += taken;
                    comet.amount -= taken;
                    totalAmount += taken;
                }
            }
            orbiting.amount += totalAmount;
            
            // Update takeAmount tracking
            const takenResource = this.takeAmount.find(r => r.type === orbiting.type);
            if (takenResource) {
                takenResource.amount = totalAmount;
            } else {
                this.takeAmount.push({ type: orbiting.type, amount: totalAmount });
            }
        }
        return used;
    }

    checkForNewAsteroids() {
        const discoverChance = Math.random();
        if (discoverChance < this.cometSpotChance) {
            this.addComet();
        }
    }

    removeAsteroidIfDone() {
        const length = this.comets.length - 1;
        for (let i = length; i >= 0; i--) {
            const comet = this.comets[i]!;
            comet.duration--;
            if (comet.duration < 0 || comet.amount < 1) {
                if (comet.drawed)
                    game?.events.emit('tractorBeam:removeComet', comet);
                this.comets.splice(i, 1);
            }
        }
    }

    addComet() {
        if (!game || this.comets.length > 20) {
            return;
        }
        const typeRoll = Math.random();
        const amountRoll = Math.random() * 100 * game.space.sector + 200;
        const durationRoll = Math.floor(Math.random() * 800 + 400);
        const speedRoll = Math.random() * 2 + 1;
        let comet: Partial<Comet> = {};

        if (typeRoll < .9) {
            comet = {
                name: "Comet",
                amountType: "ice",
                amount: amountRoll * 1000,
                initialAmount: amountRoll * 1000,
                duration: durationRoll,
                initialDuration: durationRoll,
                speed: speedRoll,
            };
        } else {
            comet = {
                name: "Asteroid",
                amountType: "dirt",
                amount: amountRoll,
                initialAmount: amountRoll,
                duration: durationRoll * 2,
                initialDuration: durationRoll * 2,
                speed: speedRoll / 2,
            };
        }
        comet.id = incrementCometId();
        comet.drawed = false;

        this.comets.push(comet as Comet);
    }
}
