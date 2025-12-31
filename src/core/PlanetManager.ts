import { game } from '../main';
import { withinDistance, precision3 } from '../utils/utils';
import { rotatePlanet } from '../ui/spaceView';
import Planet from './Planet';

export default class PlanetManager {
    static readonly MINE_TICKS_MAX = 2000;
    static readonly FACTORY_TICKS_MAX = 8000;
    static readonly SOLAR_TICKS_MAX = 1000;
    static readonly COILGUN_TICKS_MAX = 1000;
    static readonly COILGUN_CHARGE_MAX = 1000;

    static findArea(planet: Planet) {
        if (!game) return;
        let counter = 0;
        while (PlanetManager.isWithinDistanceOfAny(planet, planet.x, planet.y, 75)) {
            counter++;
            if (counter > 40) {
                console.log("too many planets");
                return;
            }
            planet.x = PlanetManager.xAreaAllowed();
            planet.y = PlanetManager.yAreaAllowed();
        }
    }

    static xAreaAllowed() {
        if (!game) return 0;
        const activeWidth = game.canvasWidth * 0.8;
        return Math.random() * (activeWidth - 200); 
    }

    static yAreaAllowed() {
        if (!game) return 0;
        const maxHeight = game.canvasHeight * 0.80;
        return Math.random() * (maxHeight - 55) + 10;
    }

    static isWithinDistanceOfAny(planet: Planet, x1: number, y1: number, radius: number) {
        if (!game) return false;
        for (let i = 0; i < game.space.planets.length; i++) {
            const target = game.space.planets[i];
            if (!target || target === planet) {
                continue;
            }
            if (withinDistance(x1, y1, target.x, target.y, radius)) {
                return true;
            }
        }
        return false;
    }

    static tick(planet: Planet) {
        PlanetManager.regenShields(planet);
        PlanetManager.tickResources(planet);
        rotatePlanet(planet);
    }

    static empty(planet: Planet) {
        return planet.dirt <= 0;
    }

    static alive(planet: Planet) {
        return planet.health > 0;
    }

    static regenShields(planet: Planet) {
        if (!PlanetManager.alive(planet)) {
            planet.atmo = 0;
            return;
        }
        planet.atmo += (planet.maxAtmo - planet.atmo) / 100;
        if (planet.atmo > planet.maxAtmo) {
            planet.atmo = planet.maxAtmo;
        }
    }

    static getShieldReduction(planet: Planet) {
        return planet.atmo / planet.maxAtmo;
    }

    static takeDamage(planet: Planet, damage: number) {
        const shieldReduction = PlanetManager.getShieldReduction(planet);
        const healthDamage = damage * (1 - shieldReduction);
        planet.atmo -= damage * shieldReduction;
        let extraDamage = 0;
        if (planet.atmo < 0) {
            extraDamage = planet.atmo * -1;
            planet.atmo = 0;
        }

        planet.health -= healthDamage + extraDamage;
        if (planet.health < 0) {
            planet.health = 0;
        }
    }

    static calcPower(planet: Planet, difficulty: number) {
        planet.power = difficulty * (planet.isBoss ? 1.5 : 1);
        planet.atmo = planet.maxAtmo = Math.min(200, precision3((planet.power * 2) + 100));
        planet.health = planet.maxHealth = precision3((planet.power * 20) + 1000);
        planet.dirt = precision3((planet.power * 200) + 2000);
        planet.maxMines = Math.floor((planet.dirt + .1) / 1000);
    }

    static workConstruction(planet: Planet, amount: number) {
        if (!PlanetManager.doneFactory(planet)) {
            PlanetManager.workOnFactory(planet, amount);
            return;
        }
        if (!PlanetManager.doneCoilgun(planet)) {
            PlanetManager.workOnCoilgun(planet, amount);
            return;
        }
        PlanetManager.workOnMine(planet, amount);
    }

    static tickResources(planet: Planet) {
        if (PlanetManager.empty(planet)) {
            return;
        }
        PlanetManager.tickMines(planet);
        PlanetManager.tickBots(planet);
        PlanetManager.tickFactory(planet);
        PlanetManager.tickSolar(planet);
        PlanetManager.tickCoilgun(planet);
    }

    static doneBuilding(planet: Planet) {
        return planet.mines >= planet.maxMines;
    }

    static workOnMine(planet: Planet, amount: number) {
        planet.mineTicks += amount;
        if (planet.mineTicks >= PlanetManager.MINE_TICKS_MAX) {
            let toAdd = Math.floor(planet.mineTicks / PlanetManager.MINE_TICKS_MAX);
            toAdd = Math.min(toAdd, planet.maxMines - planet.mines);
            planet.mines += toAdd;
            planet.mineTicks -= toAdd * PlanetManager.MINE_TICKS_MAX;
        }
    }

    static tickMines(planet: Planet) {
        planet.ore += planet.mines;
    }

    static tickBots(planet: Planet) {
        const botWork = Math.min(planet.bots, planet.ore);
        planet.ore -= botWork;
        PlanetManager.workOnSolar(planet, botWork);
    }

    static doneFactory(planet: Planet) {
        return planet.factoryTicks >= PlanetManager.FACTORY_TICKS_MAX;
    }

    static workOnFactory(planet: Planet, amount: number) {
        planet.factoryTicks += amount;
    }

    static tickFactory(planet: Planet) {
        if (planet.ore >= 200) {
            const toAdd = Math.floor(planet.ore / 200);
            planet.bots += toAdd;
            planet.ore -= toAdd * 200;
        }
    }

    static workOnSolar(planet: Planet, amount: number) {
        planet.solarTicks += amount;
        if (planet.solarTicks >= PlanetManager.SOLAR_TICKS_MAX) {
            const toAdd = Math.floor(planet.solarTicks / PlanetManager.SOLAR_TICKS_MAX);
            planet.solar += toAdd;
            planet.solarTicks -= toAdd * PlanetManager.SOLAR_TICKS_MAX;
        }
    }

    static tickSolar(planet: Planet) {
        planet.coilgunCharge += planet.solar;
    }

    static doneCoilgun(planet: Planet) {
        return planet.coilgunTicks >= PlanetManager.COILGUN_TICKS_MAX;
    }

    static workOnCoilgun(planet: Planet, amount: number) {
        planet.coilgunTicks += amount;
    }

    static tickCoilgun(planet: Planet) {
        if (planet.coilgunCharge >= PlanetManager.COILGUN_CHARGE_MAX) {
            const toAdd = Math.floor(planet.coilgunCharge / PlanetManager.COILGUN_CHARGE_MAX);
            planet.coilgunCharge -= toAdd * PlanetManager.COILGUN_CHARGE_MAX;
            let loadSize = 500 * toAdd;
            if (planet.dirt <= loadSize) {
                loadSize = planet.dirt;
            }
            planet.dirt -= loadSize;
            if (game && game.spaceStation.orbiting[1]) {
                game.spaceStation.orbiting[1].amount += loadSize;
            }
        }
    }
}
