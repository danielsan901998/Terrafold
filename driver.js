function tick() {
    if(stop) {
        return;
    }
    timer++;

    game.tick();
    if(!document.hidden)
        view.update();

    if(timer % 100 === 0) {
        save();
    }
}

function recalcInterval(newSpeed) {
    doWork.postMessage({stop:true});
    doWork.postMessage({start:true,ms:(1000 / newSpeed)});
}

function pauseGame() {
    stop = !stop;
}
