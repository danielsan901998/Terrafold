let intervalId: Timer | null = null;
self.onmessage = function(event: MessageEvent) {
    if ( event.data.start ) {
        // @ts-ignore
        intervalId = setInterval(function(){
            self.postMessage('interval.start');
        }, event.data.ms || 0);
    }
    if ( event.data.stop && intervalId !== null ) {
        // @ts-ignore
        clearInterval(intervalId);
    }
};
