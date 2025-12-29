import { game } from '../../main';
import { intToString, withinDistance } from '../utils';
import PlanetManager from '../classes/PlanetManager';

const canvas = document.getElementById("spaceCanvas") as HTMLCanvasElement;
const ctx = canvas ? canvas.getContext("2d") : null;
if (ctx) ctx.font = "11px Arial";
const xOffset = 200;
let mousePos: {x: number, y: number} = {x: 0, y: 0};

if (canvas) {
    canvas.addEventListener('mousemove', function(e) {
        mousePos = {x:e.offsetX - xOffset, y:e.offsetY};
    });
}

export default function updateSpace() {
    if (!ctx || !game || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBorders();
    drawTargets();
    drawBattleships();
    drawTooltips();
}

function drawTooltips() {
    if (!game) return;
    for(let i = 0; i < game.space.planets.length; i++) {
        drawPlanetTooltip(game.space.planets[i]!);
    }
}

function drawBattleships() {
    if (!game) return;
    for(let i = 0; i < game.space.ships.length; i++) {
        drawShip(game.space.ships[i]!);
    }
}

function drawTargets() {
    if (!game) return;
    for(let i = 0; i < game.space.planets.length; i++) {
        const planet = game.space.planets[i]!;
        drawPlanet(planet, planet.isBoss ? "B" : (i+1).toString());
    }
}

function drawBorders() {
    if (!ctx) return;
    ctx.fillStyle = "yellow";
    ctx.fillRect(100,400,800,1);
}

function drawShip(ship: any) {
    if (!ctx) return;
    const offsetX = ship.x + 200;

    ctx.translate(offsetX+25, ship.y+25);
    ctx.rotate(ship.direction);

    const point1 = {x:-10, y:-10};
    const point2 = {x:10, y:0};
    const point3 = {x:-10, y:10};
    const point4 = {x:-7, y:0};

    ctx.beginPath();
    ctx.fillStyle="#008080";
    ctx.lineWidth = 3;
    ctx.moveTo(point1.x, point1.y);
    ctx.lineTo(point2.x, point2.y);
    ctx.lineTo(point3.x, point3.y);
    ctx.lineTo(point4.x, point4.y);
    // ctx.stroke();
    ctx.fill();
    ctx.rotate(-1*ship.direction);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeText(ship.amount.toString(),-4,20);
    ctx.strokeText(intToString(ship.foodAmount / ship.amount / 10, 1),-4,30);

    ctx.translate((offsetX+25)*-1, (ship.y+25)*-1);
}

function drawPlanet(planet: any, text: string) {
    if (!ctx) return;
    const size = getPlanetSize(planet.isBoss);
    const offsetX = planet.x + xOffset;
    ctx.translate(offsetX+size, planet.y+size);

    drawPlanetAtmo(planet, size);
    drawPlanetHealth(planet, size);
    drawPlanetObjects(planet, size);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.strokeText(text,-3,4);

    ctx.translate((offsetX+size)*-1, (planet.y+size)*-1);
}

function drawPlanetTooltip(planet: any) {
    if (!ctx) return;
    const size = getPlanetSize(planet.isBoss);
    const offsetX = planet.x + xOffset;

    planet.showTooltip = withinDistance(mousePos.x, mousePos.y, planet.x+size, planet.y+size, 50);
    if(!planet.showTooltip) {
        return;
    }

    ctx.translate(offsetX+size, planet.y+size);

    ctx.strokeStyle = "#ffe5d5";
    ctx.lineWidth = 1;
    ctx.strokeText("Atmosphere: " + intToString(planet.atmo, 2),-15,size);
    ctx.strokeText("Reduction: "+intToString(PlanetManager.getShieldReduction(planet)*100, 1)+"%",-15,size+10);
    ctx.strokeText("Health: "+intToString(planet.health, 1),-15,size+20);
    ctx.strokeText("Dirt: "+intToString(planet.dirt, 1),-15,size+30);
    ctx.strokeText("Ore: "+intToString(planet.ore, 1),-15,size+40);
    ctx.strokeText("C.Bots: "+planet.bots+ " / " + planet.maxMines,-15,size+50);
    ctx.strokeText("Solar: "+planet.solar,-15,size+60);
    ctx.strokeText("Build Factory: "+planet.factoryTicks+" / " + planet.factoryTicksMax,-15,size+70);
    ctx.strokeText("Build Coilgun: "+planet.coilgunTicks+" / " + planet.coilgunTicksMax,-15,size+80);
    ctx.strokeText("Coilgun Charge: "+intToString(planet.coilgunCharge,1)+" / " + planet.coilgunChargeMax,-15,size+90);
    ctx.strokeText("Build Solar: "+intToString(planet.solarTicks,1)+" / " + planet.solarTicksMax,-15,size+100);
    ctx.strokeText("Mines: "+planet.mines+ " / " + planet.maxMines,-15,size+110);
    ctx.strokeText("Build Mine: "+planet.mineTicks+ " / " + planet.mineTicksMax,-15,size+120);

    ctx.translate((offsetX+size)*-1, (planet.y+size)*-1);
}

function drawPlanetAtmo(planet: any, size: number) {
    if (!ctx) return;
    const atmoRatio = size * (planet.atmo / planet.maxAtmo / 2 + .5);
    const atmosphere = ctx.createRadialGradient(0, 0, atmoRatio*1.1, 0, 0, atmoRatio/3.3);
    atmosphere.addColorStop(0, 'black');
    const color = "hsl("+ (planet.view.color+120) +",90%,60%)";
    atmosphere.addColorStop(1, color);
    ctx.fillStyle = atmosphere;
    ctx.fillRect(-size,-size,size*2,size*2);

    ctx.beginPath();
    ctx.strokeStyle="#008080";
    ctx.lineWidth = 3;
    ctx.arc(0,0,size-4,0,2*Math.PI * (planet.atmo / planet.maxAtmo));
    ctx.stroke();
}

function drawPlanetHealth(planet: any, size: number) {
    if (!ctx) return;
    ctx.beginPath();
    const saturation = Math.floor(planet.health / planet.maxHealth * 70 + 10); // 10-80
    ctx.fillStyle = "hsl("+ planet.view.color +","+saturation+"%,"+planet.view.light+"%)";
    ctx.arc(0,0,size/2,0,2*Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle="#b6000b";
    ctx.lineWidth = 3;
    ctx.moveTo(-size*2/3, -size);
    ctx.lineTo(-size*2/3 + (size*4/3 * (planet.health / planet.maxHealth)), -size);
    ctx.stroke();
}

function drawPlanetObjects(planet: any, size: number) {
    if (!ctx) return;
    ctx.rotate(planet.view.rotation);
    ctx.rotate(-1*planet.view.rotation);
}

export function rotatePlanet(planet: any) { // Done on planet's tick
    planet.view.rotation += planet.view.rotationSpeed/10+.01;
    if(planet.view.rotation >= Math.PI * 2) {
        planet.view.rotation -= Math.PI * 2;
    }
}

function getPlanetSize(isBoss: boolean | number) {
    return isBoss ? 40 : 25;
}
