var doWork = new Worker('interval.js');
doWork.onmessage = function (event) {
    if (event.data === 'interval.start') {
        tick();
    }
};

var view;
var game;
var timer = 0;
var stop = 0;
var cometId = 0;

var timeList = [];

function clearSave() {
    window.localStorage.terrafold2 = "";
    load();
}

function loadDefaults() {
    view = new View();
    game = new Game();
    game.initialize();
}

function setInitialView() {
    view.checkSpaceDockUnlocked();
    view.updateSpaceDock();
    view.checkTractorBeamUnlocked();
    view.checkSpaceStationUnlocked();
    view.checkEnergyUnlocked();
    view.updateComputer();
    view.checkComputerUnlocked();
    view.updateRobots();
    view.checkRobotsUnlocked();
}


function load() {
    loadDefaults();
    if (!window.localStorage.terrafold2) { //New players to the game
        setInitialView();
        recalcInterval(10);
        return;
    }
    var toLoad = JSON.parse(decode(window.localStorage.terrafold2));
    copyObject(toLoad,game);

    for(let comet of game.tractorBeam.comets)
        comet.drawed=false;
    game.spaceDock.battleships += game.spaceDock.sended;
    game.spaceDock.sended = 0;

    //-1 because create new planets increase it.
    game.space.sector--;

    document.getElementById('scienceSlider').value = game.population.scienceRatio;

    setInitialView();
    recalcInterval(10);
}

function copyObject(object, toSave) {
    for(var property in object) {
        if(typeof object[property] === 'object'){
            if(typeof toSave[property] === 'undefined')
                toSave[property]={};
            copyObject(object[property], toSave[property]);
        }
        else if(typeof object[property] !== 'function')
            toSave[property] = object[property];
    }
}

function save() {
    var toSave={};
    copyObject(game,toSave)
    toSave.space.planets=[];
    toSave.space.ships=[];
    window.localStorage.terrafold2 = encode(JSON.stringify(toSave));
}

function exportSave() {
    save();
    document.getElementById("exportImportSave").value = encode(window.localStorage.terrafold2);
    document.getElementById("exportImportSave").select();
    document.execCommand('copy');
    document.getElementById("exportImportSave").value = "";
}

function importSave() {
    window.localStorage.terrafold2 = decode(document.getElementById("exportImportSave").value);

    load();
}
function cheat(){
    game.ice.ice=100000000000
    game.science=1000000000000
    game.farms.farms=100000000000
    game.cash=1000000000000
    game.oxygen=100000000000000000
    game.wood=100000000
    game.metal=100000000
}
load();
