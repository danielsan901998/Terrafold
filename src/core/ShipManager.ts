import { game } from '../main';
import { withinDistance, getDistance } from '../utils/utils';
import PlanetManager from './PlanetManager';
import Ship from './Ship';
import Planet from './Planet';
import { Target } from '../types';

export default class ShipManager {
    static foodPerShip = 20;
    static actionRate = 1;
    static actionSpeed = 40;
    static defaultSpeed = 0.5;
    static emptySpeed = 0.05;
    static globalTargetIndex = -1;

    static tick(ship: Ship) {
        ShipManager.checkEmpty(ship);
        ShipManager.moveToNearestTarget(ship);
        ShipManager.checkJoinFleet(ship);
        ShipManager.attackTarget(ship);
    }

    static updateGlobalTarget() {
        if (!game) return;
        const home = game.hangar.getTarget();
        ShipManager.globalTargetIndex = ShipManager.findClosestTarget(home.x, home.y);
    }

    static findClosestTarget(x: number, y: number): number {
        if (!game) return -1;
        let bestIndex = -1;
        let minDist = Infinity;
        for (let i = 0; i < game.space.planets.length; i++) {
            const planet = game.space.planets[i]!;
            if (!PlanetManager.doneBuilding(planet)) {
                const dist = getDistance(x, y, planet.x, planet.y);
                if (bestIndex === -1 || dist < minDist) {
                    bestIndex = i;
                    minDist = dist;
                }
            }
        }
        return bestIndex;
    }

    static checkJoinFleet(ship: Ship) {
        if (!game || !ship.engaged) {
            return;
        }
        for (let i = game.space.ships.length - 1; i >= 0; i--) {
            const otherShip = game.space.ships[i]!;
            if (otherShip === ship || ShipManager.isEmpty(otherShip)) { // only join on same types
                continue;
            }
            if (withinDistance(ship.x, ship.y, otherShip.x, otherShip.y, 20)) {
                ShipManager.combineShips(ship, otherShip);
                game.space.ships.splice(i, 1);
            }
        }
    }

    static checkEmpty(ship: Ship) {
        ship.food -= ship.count;
        if (!ShipManager.isEmpty(ship)) {
            return;
        }
        ship.food = 0;
        ship.engaged = false;
        ship.targetIndex = -1;
    }

    static getTargetObject(ship: Ship): Target | null {
        if (!game) return null;
        if (ship.targetIndex === -1) return game.hangar.getTarget();
        if (ship.targetIndex >= 0 && ship.targetIndex < game.space.planets.length) {
            const planet = game.space.planets[ship.targetIndex]!;
            if (!PlanetManager.doneBuilding(planet)) {
                return planet;
            }
        }
        // If current target is invalid or done, find a new one
        ship.targetIndex = ShipManager.findClosestTarget(ship.x, ship.y);
        return ship.targetIndex === -1 ? game.hangar.getTarget() : game.space.planets[ship.targetIndex]!;
    }

    static returnHome(ship: Ship) {
        if (!game) return;
        game.spaceDock.battleships += ship.count;
        game.spaceDock.sended -= ship.count;
        game.farms.food += ship.food * ShipManager.foodPerShip;
        for (let i = game.space.ships.length - 1; i >= 0; i--) {
            const otherShip = game.space.ships[i];
            if (otherShip === ship) {
                game.space.ships.splice(i, 1);
                break;
            }
        }
    }

    static isEmpty(ship: Ship) {
        return ship.food <= 0;
    }

    static getSpeed(ship: Ship) {
        return ShipManager.isEmpty(ship) ? ShipManager.emptySpeed : ShipManager.defaultSpeed;
    }

    static moveToNearestTarget(ship: Ship) {
        const target = ShipManager.getTargetObject(ship);
        if (!target) return;

        if (getDistance(ship.x, ship.y, target.x, target.y) < 40) {
            if (!('isHome' in target)) {
                ship.engaged = true;
                return;
            }
            ShipManager.returnHome(ship);
            return;
        }
        
        ship.engaged = false;
        const magnitude = ShipManager.getSpeed(ship);
        let extraTurn = 0;
        const firstVC = target.y - ship.y;
        const secondVC = target.x - ship.x;
        if ((firstVC >= 0 && secondVC < 0) || (firstVC < 0 && secondVC < 0)) {
            extraTurn = Math.PI;
        }
        const direction = Math.atan(firstVC / secondVC) + extraTurn; // (y2-y1)/(x2-x1)
        ship.x = ship.x + magnitude * Math.cos(direction); // ||v||cos(theta)
        ship.y = ship.y + magnitude * Math.sin(direction);
        ship.direction = direction;
    }

    static attackTarget(ship: Ship) {
        const target = ShipManager.getTargetObject(ship);
        if (target && !('isHome' in target) && ship.engaged) {
            const planet = target as Planet;
            ship.actionCounter++;
            if (ship.actionCounter >= ShipManager.actionSpeed) {
                ship.actionCounter = 0;
                if (PlanetManager.alive(planet)) {
                    PlanetManager.takeDamage(planet, ShipManager.actionRate * ship.count);
                } else {
                    PlanetManager.workConstruction(planet, ship.count);
                    if (PlanetManager.doneBuilding(planet)) {
                        ship.engaged = false;
                        ship.targetIndex = ShipManager.findClosestTarget(ship.x, ship.y);
                    }
                }
            }
        }
    }

    static combineShips(ship1: Ship, ship2: Ship) {
        ship1.count += ship2.count;
        ship1.energy += ship2.energy;
        ship1.food += ship2.food;
        if (ship2.actionCounter > ship1.actionCounter) {
            ship1.actionCounter = ship2.actionCounter;
        }
    }
}
