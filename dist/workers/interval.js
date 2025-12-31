var t=null;self.onmessage=function(a){if(a.data.start)t=setInterval(function(){self.postMessage("interval.start")},a.data.ms||0);if(a.data.stop&&t!==null)clearInterval(t)};

//# debugId=857A867583CC03F464756E2164756E21
//# sourceMappingURL=interval.js.map
