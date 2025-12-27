const PlanetManager = {
    findArea: function(planet) {
        for(var i = 0; i < game.space.planets.length; i++) {
            var target = game.space.planets[i];
            if(target === planet) {
                continue;
            }
            var counter = 0;
            while(PlanetManager.withinDistance(planet, planet.x, planet.y, 75)) {
                counter++;
                if(counter > 40) {
                    console.log("too many planets");
                    return;
                }
                planet.x = PlanetManager.xAreaAllowed();
                planet.y = PlanetManager.yAreaAllowed();
            }
        }
    },
    xAreaAllowed: function() {
        return Math.random() * 620;
    },
    yAreaAllowed: function() {
        return Math.random() * 330 + 5;
    },
    withinDistance: function(planet, x1, y1, radius) {
        for(var i = 0; i < game.space.planets.length; i++) {
            var target = game.space.planets[i];
            if(target === planet) {
                continue;
            }
            if(withinDistance(x1, y1, target.x, target.y, radius)) {
                return true;
            }
        }
        return false;
    },

    tick: function(planet) {
        PlanetManager.regenShields(planet);
        PlanetManager.tickResources(planet);
        rotatePlanet(planet); // assuming rotatePlanet is a global or helper function
    },
    empty: function(planet) {
        return planet.dirt <= 0;
    },
    alive: function(planet) {
        return planet.health > 0;
    },
    regenShields: function(planet) {
        if(!PlanetManager.alive(planet)) {
            planet.atmo = 0;
            return;
        }
        planet.atmo += (planet.maxAtmo - planet.atmo) / 100;
        if(planet.atmo > planet.maxAtmo) {
            planet.atmo = planet.maxAtmo;
        }
    },
    getShieldReduction: function(planet) {
        return planet.atmo / planet.maxAtmo;
    },
    takeDamage: function(planet, damage) {
        var healthDamage = damage * (1 - PlanetManager.getShieldReduction(planet));
        planet.atmo -= damage * PlanetManager.getShieldReduction(planet);
        var extraDamage = 0;
        if(planet.atmo < 0) {
            extraDamage = planet.atmo * -1;
            planet.atmo = 0;
        }

        planet.health -= healthDamage + extraDamage;
        if(planet.health < 0) {
            planet.health = 0;
        }
    },

    calcPower: function(planet, difficulty) { //difficulty starts at 1
        planet.power = difficulty * (planet.isBoss?1.5:1);
        //limit max atmosphere to avoid drawing to become to too big
        planet.atmo = planet.maxAtmo = Math.min(200,precision3((planet.power*2)+100));
        planet.health = planet.maxHealth = precision3((planet.power*20)+1000);
        planet.dirt = precision3((planet.power*200)+2000);

        planet.mineTicksMax = 2000;
        planet.factoryTicksMax = 8000;
        planet.maxMines = Math.floor((planet.dirt+.1) / 1000);
        planet.solarTicksMax = 1000;
        planet.coilgunTicksMax = 1000;
    },

    workConstruction: function(planet, amount) { //Comes from ships
        if(!PlanetManager.doneFactory(planet)) {
            PlanetManager.workOnFactory(planet, amount);
            return;
        }
        if(!PlanetManager.doneCoilgun(planet)) {
            PlanetManager.workOnCoilgun(planet, amount);
            return;
        }
        PlanetManager.workOnMine(planet, amount);
    },
    tickResources: function(planet) {
        if(PlanetManager.empty(planet)) {
            return;
        }
        PlanetManager.tickMines(planet);
        PlanetManager.tickBots(planet);
        PlanetManager.tickFactory(planet);
        PlanetManager.tickSolar(planet);
        PlanetManager.tickCoilgun(planet);
    },

    doneBuilding: function(planet) {
        return planet.mines >= planet.maxMines;
    },
    workOnMine: function(planet, amount) {
        planet.mineTicks += amount;
        if(planet.mineTicks >= planet.mineTicksMax) {
            var toAdd = Math.floor(planet.mineTicks / planet.mineTicksMax);
            toAdd = Math.min(toAdd,planet.maxMines-planet.mines);
            planet.mines+=toAdd;
            planet.mineTicks -= toAdd * planet.mineTicksMax;
        }
    },
    tickMines: function(planet) {
        planet.ore += planet.mines;
    },

    tickBots: function(planet) {
        var botWork = planet.bots;
        planet.ore -= botWork;
        PlanetManager.workOnSolar(planet, botWork);
    },

    doneFactory: function(planet) {
        return planet.factoryTicks >= planet.factoryTicksMax;
    },
    workOnFactory: function(planet, amount) {
        planet.factoryTicks += amount;
    },
    tickFactory: function(planet) {
        if(planet.ore >= 200) {
            const toAdd = Math.floor(planet.ore / 200);
            planet.bots+=toAdd;
            planet.ore -= toAdd * 200;
        }
    },

    workOnSolar: function(planet, amount) {
        planet.solarTicks += amount;
        if(planet.solarTicks >= planet.solarTicksMax) {
            const toAdd = Math.floor(planet.solarTicks / planet.solarTicksMax);
            planet.solar+=toAdd;
            planet.solarTicks -= toAdd * planet.solarTicksMax;
        }
    },
    tickSolar: function(planet) {
        planet.coilgunCharge += planet.solar;
    },

    doneCoilgun: function(planet) {
        return planet.coilgunTicks >= planet.coilgunTicksMax;
    },
    workOnCoilgun: function(planet, amount) {
        planet.coilgunTicks += amount;
    },
    tickCoilgun: function(planet) {
        if(planet.coilgunCharge >= planet.coilgunChargeMax) {
            const toAdd = Math.floor(planet.coilgunCharge / planet.coilgunChargeMax);
            planet.coilgunCharge -= toAdd * planet.coilgunChargeMax;
            var loadSize = 500 * toAdd;
            if(planet.dirt <= loadSize) {
                loadSize = planet.dirt;
            }
            planet.dirt -= loadSize;
            //TODO create a meteorite and launch it instead
            game.spaceStation.orbiting[1].amount += loadSize
        }
    },
};
