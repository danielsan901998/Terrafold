function Planet() {
    this.isBoss = 0;
    this.view = {};
    this.view.rotation = 0;
    this.view.rotationSpeed = Math.random();
    this.view.color = Math.floor(Math.random() * 360);
    this.view.light = Math.floor(Math.random() * 15 + 40);

    this.findArea = function() {
        for(var i = 0; i < game.space.planets.length; i++) {
            var target = game.space.planets[i];
            if(target === this) {
                continue;
            }
            var counter = 0;
            while(this.withinDistance(this.x, this.y, 75)) {
                counter++;
                if(counter > 40) {
                    console.log("too many planets");
                    return;
                }
                this.x = this.xAreaAllowed();
                this.y = this.yAreaAllowed();
            }
        }
    };
    this.xAreaAllowed = function() {
        return Math.random() * 620;
    };
    this.yAreaAllowed = function() {
        return Math.random() * 330 + 5;
    };
    this.withinDistance = function(x1, y1, radius) {
        for(var i = 0; i < game.space.planets.length; i++) {
            var target = game.space.planets[i];
            if(target === this) {
                continue;
            }
            if(withinDistance(x1, y1, target.x, target.y, radius)) {
                return true;
            }
        }
        return false;
    };

    this.x = this.xAreaAllowed();
    this.y = this.yAreaAllowed();
    this.findArea();


    this.tick = function() {
        this.regenShields();
        this.tickResources();
        rotatePlanet(this);
    };
    this.empty = function() {
        return this.dirt <= 0;
    };
    this.alive = function() {
        return this.health > 0;
    };
    this.regenShields = function() {
        if(!this.alive()) {
            this.atmo = 0;
            return;
        }
        this.atmo += (this.maxAtmo - this.atmo) / 100;
        if(this.atmo > this.maxAtmo) {
            this.atmo = this.maxAtmo;
        }
    };
    this.getShieldReduction = function() {
        return this.atmo / this.maxAtmo;
    };
    this.takeDamage = function(damage) {
        var healthDamage = damage * (1 - this.getShieldReduction());
        this.atmo -= damage * this.getShieldReduction();
        var extraDamage = 0;
        if(this.atmo < 0) {
            extraDamage = this.atmo * -1;
            this.atmo = 0;
        }

        this.health -= healthDamage + extraDamage;
        if(this.health < 0) {
            this.health = 0;
        }
    };

    this.calcPower = function(difficulty) { //difficulty starts at 1
        this.power = difficulty * (this.isBoss?1.5:1);
        //limit max atmosphere to avoid drawing to become to too big
        this.atmo = this.maxAtmo = Math.min(200,precision3((this.power*2)+100));
        this.health = this.maxHealth = precision3((this.power*20)+1000);
        this.dirt = precision3((this.power*200)+2000);

        this.mineTicksMax = 2000;
        this.factoryTicksMax = 8000;
        this.maxMines = Math.floor((this.dirt+.1) / 1000);
        this.solarTicksMax = 1000;
        this.coilgunTicksMax = 1000;
    };

    this.workConstruction = function(amount) { //Comes from ships
        if(!this.doneFactory()) {
            this.workOnFactory(amount);
            return;
        }
        if(!this.doneCoilgun()) {
            this.workOnCoilgun(amount);
            return;
        }
        this.workOnMine(amount);
    };
    this.tickResources = function() {
        if(this.empty()) {
            return;
        }
        this.tickMines();
        this.tickBots();
        this.tickFactory();
        this.tickSolar();
        this.tickCoilgun();
    };


    this.mines = 0;
    this.mineTicks = 0;
    this.ore = 0;
    this.doneBuilding = function() {
        return this.mines >= this.maxMines;
    };
    this.workOnMine = function(amount) {
        this.mineTicks += amount;
        if(this.mineTicks >= this.mineTicksMax) {
            var toAdd = Math.floor(this.mineTicks / this.mineTicksMax);
            toAdd = Math.min(toAdd,this.maxMines-this.mines);
            this.mines+=toAdd;
            this.mineTicks -= toAdd * this.mineTicksMax;
        }
    };
    this.tickMines = function() {
        this.ore += this.mines;
    };

    this.bots = 0;
    this.tickBots = function() {
        var botWork = this.bots;
        this.ore -= botWork;
        this.workOnSolar(botWork);
    };

    this.factoryTicks = 0;
    this.doneFactory = function() {
        return this.factoryTicks >= this.factoryTicksMax;
    };
    this.workOnFactory = function(amount) {
        this.factoryTicks += amount;
    };
    this.tickFactory = function() {
        if(this.ore >= 200) {
            this.ore -= 200;
            this.bots++;
        }
    };

    this.solarTicks = 0;
    this.solar = 0;
    this.workOnSolar = function(amount) {
        this.solarTicks += amount;
        if(this.solarTicks >= this.solarTicksMax) {
            const toAdd = Math.floor(this.solarTicks / this.solarTicksMax);
            this.solar+=toAdd;
            this.solarTicks -= toAdd * this.solarTicksMax;
        }
    };
    this.tickSolar = function() {
        this.coilgunCharge += this.solar;
    };

    this.energy = 0;
    this.coilgunTicks = 0;
    this.coilgunCharge = 0;
    this.coilgunChargeMax = 1000;
    this.doneCoilgun = function() {
        return this.coilgunTicks >= this.coilgunTicksMax;
    };
    this.workOnCoilgun = function(amount) {
        this.coilgunTicks += amount;
    };
    this.tickCoilgun = function() {
        if(this.coilgunCharge >= this.coilgunChargeMax) {
            const toAdd = Math.floor(this.coilgunCharge / this.coilgunChargeMax);
            this.coilgunCharge -= toAdd * this.coilgunChargeMax;
            var loadSize = 500 * toAdd;
            if(this.dirt <= loadSize) {
                loadSize = this.dirt;
            }
            this.dirt -= loadSize;
            //TODO create a meteorite and launch it instead
            game.spaceStation.orbiting[1].amount += loadSize
        }
    };
}
