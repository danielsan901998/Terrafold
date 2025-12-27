const ShipManager = {
    foodPerShip: 20,
    tick: function(ship) {
        ShipManager.checkEmpty(ship);
        ShipManager.moveToNearestTarget(ship);
        ShipManager.checkJoinFleet(ship);
        ShipManager.attackTarget(ship);
    },

    checkJoinFleet: function(ship) {
        if(!ship.engaged) {
            return;
        }
        for(var i = game.space.ships.length-1; i >= 0; i--) {
            var otherShip = game.space.ships[i];
            if(otherShip === ship || ShipManager.isEmpty(otherShip)) { //only join on same types
                continue;
            }
            if(withinDistance(ship.x, ship.y, otherShip.x, otherShip.y, 20)) {
                ShipManager.combineShips(ship, otherShip);
                game.space.ships.splice(i, 1);
            }
        }
    },

    findClosestTarget: function(ship) {
        var pos = 0;
        var targetPlanet = null;
        for(var i = 0; i < game.space.planets.length; i++) {
            var planet = game.space.planets[i];
            // Use PlanetManager functions
            if(PlanetManager.doneBuilding(planet)) {
                continue;
            }
            if(!targetPlanet) {
                targetPlanet = planet;
                continue;
            }
            if(getDistance(ship.x, ship.y, planet.x, planet.y) < getDistance(ship.x, ship.y, targetPlanet.x, targetPlanet.y)) {
                pos = i;
                targetPlanet = game.space.planets[pos];
            }
        }
        return targetPlanet ? targetPlanet : ShipManager.targetHome(ship);
    },

    checkEmpty: function(ship) {
        ship.foodAmount -= ship.amount;
        if(!ShipManager.isEmpty(ship)) {
            return;
        }
        ship.foodAmount = 0;
        ship.speed = .05;
        ship.target = ShipManager.targetHome(ship);
        ship.engaged = false;
    },

    targetHome: function(ship) {
        return game.hangar.getTarget();
    },
    returnHome: function(ship) {
        game.spaceDock.battleships += ship.amount;
        game.spaceDock.sended -= ship.amount;
        game.farms.food += ship.foodAmount * ShipManager.foodPerShip;
        for(var i = game.space.ships.length-1; i >= 0; i--) {
            var otherShip = game.space.ships[i];
            if(otherShip === ship) {
                game.space.ships.splice(i, 1);
                break;
            }
        }
    },

    isEmpty: function(ship) {
        return ship.foodAmount <= 0;
    },

    moveToNearestTarget: function(ship) {
        if(!ship.target || (!ship.target.isHome && PlanetManager.doneBuilding(ship.target))) { // Use PlanetManager
            ship.target = ShipManager.findClosestTarget(ship);
            ship.engaged = false;
        }
        if(getDistance(ship.x, ship.y, ship.target.x, ship.target.y) <  40) {
            if(!ship.target.isHome) {
                ship.engaged = true;
                return;
            }
            ShipManager.returnHome(ship);
        }
        var magnitude = ship.speed;
        var extraTurn = 0;
        var firstVC = ship.target.y - ship.y;
        var secondVC = ship.target.x - ship.x;
        if((firstVC >= 0 && secondVC < 0) || (firstVC < 0 && secondVC < 0)) {
            extraTurn = Math.PI;
        }
        var direction = Math.atan(firstVC/secondVC)+extraTurn; //(y2-y1)/(x2-x1)
        ship.x = ship.x + magnitude * Math.cos(direction); //||v||cos(theta)
        ship.y = ship.y + magnitude * Math.sin(direction);
        ship.direction = direction;
    },

    attackTarget: function(ship) {
        if(ship.target && !ship.target.isHome && ship.engaged) {
            ship.actionCounter++;
            if(ship.actionCounter >= ship.actionSpeed) {
                ship.actionCounter = 0;
                // Use PlanetManager functions
                if(PlanetManager.alive(ship.target)){
                    PlanetManager.takeDamage(ship.target, ship.actionRate * ship.amount);
                }else{
                    PlanetManager.workConstruction(ship.target, ship.amount);
                    if(PlanetManager.doneBuilding(ship.target)) {
                        ship.engaged = false;
                        ship.target = ShipManager.findClosestTarget(ship);
                    }
                }
            }
        }
    },

    combineShips: function(ship1, ship2) {
        ship1.amount += ship2.amount;
        ship1.energy += ship2.energy;
        ship1.foodAmount += ship2.foodAmount;
        if(ship2.actionCounter > ship1.actionCounter) {
            ship1.actionCounter = ship2.actionCounter;
        }
    },
};
