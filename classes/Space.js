function Space() {
    this.planets = [];
    this.ships = [];
    this.sector = 0;
    this.tick = function() {
        var empty=true;
        for(var i = 0; i < this.planets.length; i++) {
            this.planets[i].tick();
            if(this.planets[i].empty()==false)
                empty=false;
        }
        if(empty && this.ships.length==0){
            this.planets=[];
            this.sector++;
            this.newLevel();
        }
        for(i = 0; i < this.ships.length; i++) {
            this.ships[i].tick();
        }
    };

    this.spawnShip = function(ship, y) {
        ship.x = -120;
        ship.y = y;
        this.ships.push(ship);
    };

    this.newLevel = function() {
        for(var i = 0; i < 10; i++) {
            this.planets.push(new Planet());
        }
        sortArrayObjectsByValue(this.planets, "x");
        this.planets[this.planets.length - 1].isBoss = true; //rightmost planet

        for(i = 0; i < this.planets.length; i++) {
            this.planets[i].calcPower(this.sector);
        }
    };
}
