import { game } from '../main';
import { intToString, withinDistance } from '../utils/utils';
import PlanetManager from '../core/PlanetManager';
import ShipManager from '../core/ShipManager';
import Ship from '../core/Ship';
import Planet from '../core/Planet';

const canvas = document.getElementById("spaceCanvas") as HTMLCanvasElement;
const ctx = canvas ? canvas.getContext("2d") : null;
if (ctx) ctx.font = "13px Arial";
let xOffset = 240;
let mousePos: {x: number, y: number} = {x: 0, y: 0};

function resizeCanvas() {
    if (!canvas || !game) return;
    if (canvas.width !== game.canvasWidth || canvas.height !== game.canvasHeight) {
        canvas.width = game.canvasWidth;
        canvas.height = game.canvasHeight;
        xOffset = canvas.width / 5; 
        if (ctx) ctx.font = "13px Arial";
    }
}

if (canvas) {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    canvas.addEventListener('mousemove', function(e) {
        mousePos = {x:e.offsetX - xOffset, y:e.offsetY};
    });
}

export default function updateSpace() {
    if (!ctx || !game || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    if (!ctx || !canvas) return;
    ctx.fillStyle = "yellow";
    // Scale borders to canvas size
    ctx.fillRect(canvas.width * 0.1, canvas.height * 0.85, canvas.width * 0.8, 1);
}

function drawShip(ship: Ship) {
    if (!ctx) return;
    const offsetX = ship.x + xOffset;

    // Laser animation
    const target = ShipManager.getTargetObject(ship);
    if (ship.engaged && target && ship.actionCounter < 10) {
        const isHome = 'isHome' in target;
        const targetSize = getPlanetSize(!isHome ? (target as Planet).isBoss : false);
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 50, 50, " + (1 - ship.actionCounter / 10) + ")";
        ctx.lineWidth = 3;
        ctx.moveTo(offsetX + 25, ship.y + 25);
        ctx.lineTo(target.x + xOffset + targetSize, target.y + targetSize);
        ctx.stroke();
        ctx.restore();
    }

    ctx.save();
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
    ctx.restore();

    ctx.save();
    ctx.translate(offsetX+25, ship.y+25);
    ctx.fillStyle = "white";
    ctx.fillText(intToString(ship.count),-4,20);
    ctx.fillText(intToString(ship.food / ship.count / 10,1),-4,30);
    ctx.restore();
}

function drawPlanet(planet: any, text: string) {
    if (!ctx) return;
    const size = getPlanetSize(planet.isBoss);
    const offsetX = planet.x + xOffset;
    
    ctx.save();
    ctx.translate(offsetX+size, planet.y+size);

    drawPlanetAtmo(planet, size);
    drawPlanetHealth(planet, size);
    drawPlanetObjects(planet, size);

    ctx.fillStyle = "white";
    ctx.fillText(text,-3,4);
    ctx.restore();
}

function drawPlanetTooltip(planet: any) {
    if (!ctx) return;
    const size = getPlanetSize(planet.isBoss);
    const offsetX = planet.x + xOffset;

    const showTooltip = withinDistance(mousePos.x, mousePos.y, planet.x+size, planet.y+size, 50);
    if(!showTooltip) {
        return;
    }

    ctx.save();
    ctx.translate(offsetX+size, planet.y+size);

    ctx.fillStyle = "#ffffff";
    ctx.fillText("Atmosphere: " + intToString(planet.atmo),-15,size);
    ctx.fillText("Reduction: "+intToString(PlanetManager.getShieldReduction(planet)*100)+"%",-15,size+10);
    ctx.fillText("Health: "+intToString(planet.health),-15,size+20);
    ctx.fillText("Dirt: "+intToString(planet.dirt),-15,size+30);
    ctx.fillText("Ore: "+intToString(planet.ore),-15,size+40);
    ctx.fillText("C.Bots: "+intToString(planet.bots)+ " / " + intToString(planet.maxMines),-15,size+50);
    ctx.fillText("Solar: "+intToString(planet.solar),-15,size+60);
    ctx.fillText("Build Factory: "+intToString(planet.factoryTicks)+" / " + intToString(PlanetManager.FACTORY_TICKS_MAX),-15,size+70);
    ctx.fillText("Build Coilgun: "+intToString(planet.coilgunTicks)+" / " + intToString(PlanetManager.COILGUN_TICKS_MAX),-15,size+80);
    ctx.fillText("Coilgun Charge: "+intToString(planet.coilgunCharge)+" / " + intToString(PlanetManager.COILGUN_CHARGE_MAX),-15,size+90);
    ctx.fillText("Build Solar: "+intToString(planet.solarTicks)+" / " + intToString(PlanetManager.SOLAR_TICKS_MAX),-15,size+100);
    ctx.fillText("Mines: "+intToString(planet.mines)+ " / " + intToString(planet.maxMines),-15,size+110);
    ctx.fillText("Build Mine: "+intToString(planet.mineTicks)+ " / " + intToString(PlanetManager.MINE_TICKS_MAX),-15,size+120);

    ctx.restore();
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
    if (!ctx || PlanetManager.empty(planet)) return;
    
    const quarterTurn = Math.PI / 2;
    const startAngle = -quarterTurn;

    // Factory: Progress arc (Outer)
    if (planet.factoryTicks > 0 && planet.factoryTicks < PlanetManager.FACTORY_TICKS_MAX) {
        const percentage = planet.factoryTicks / PlanetManager.FACTORY_TICKS_MAX;
        const endAngle = (2 * percentage * Math.PI) - quarterTurn;
        ctx.beginPath();
        ctx.strokeStyle = "#888888";
        ctx.lineWidth = 2;
        ctx.arc(0, 0, size * 0.9, startAngle, endAngle);
        ctx.stroke();
    }

    // Coilgun: Construction arc
    if (planet.coilgunTicks > 0 && planet.coilgunTicks < PlanetManager.COILGUN_TICKS_MAX) {
        const percentage = planet.coilgunTicks / PlanetManager.COILGUN_TICKS_MAX;
        const endAngle = (2 * percentage * Math.PI) - quarterTurn;
        ctx.beginPath();
        ctx.strokeStyle = "#884400";
        ctx.lineWidth = 2;
        ctx.arc(0, 0, size * 0.8, startAngle, endAngle);
        ctx.stroke();
    }

    // Coilgun: Charge arc
    if (planet.coilgunTicks >= PlanetManager.COILGUN_TICKS_MAX && planet.coilgunCharge > 0) {
        const percentage = planet.coilgunCharge / PlanetManager.COILGUN_CHARGE_MAX;
        const endAngle = (2 * percentage * Math.PI) - quarterTurn;
        ctx.beginPath();
        ctx.strokeStyle = "#ffcc00"; // Gold for charge
        ctx.lineWidth = 2;
        ctx.arc(0, 0, size * 0.8, startAngle, endAngle);
        ctx.stroke();
    }

    // Solar: Progress arc (Next panel)
    if (planet.solar > 0 || planet.solarTicks > 0) {
        const percentage = planet.solarTicks / PlanetManager.SOLAR_TICKS_MAX;
        const endAngle = (2 * percentage * Math.PI) - quarterTurn;
        ctx.beginPath();
        ctx.strokeStyle = "#4444ff"; // Bright blue
        ctx.lineWidth = 2;
        ctx.arc(0, 0, size * 0.7, startAngle, endAngle);
        ctx.stroke();
    }

    // Mines: Progress arc (Inner)
    if (planet.mines < planet.maxMines && planet.mineTicks > 0) {
        const percentage = planet.mineTicks / PlanetManager.MINE_TICKS_MAX;
        const endAngle = (2 * percentage * Math.PI) - quarterTurn;
        ctx.beginPath();
        ctx.strokeStyle = "#666666";
        ctx.lineWidth = 2;
        ctx.arc(0, 0, size * 0.6, startAngle, endAngle);
        ctx.stroke();
    }
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
