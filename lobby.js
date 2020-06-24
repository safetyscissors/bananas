var c = document.getElementById("background");
var ctx = c.getContext("2d");
var cH;
var cW;
var bgColor = "#FF6138";
var animations = [];
var circles = [];

var colorPicker = (function() {
    var colors = ["#FF6138", "#FFBE53", "#2980B9", "#282741"];
    var index = 0;
    function next() {
        index = index++ < colors.length-1 ? index : 0;
        return colors[index];
    }
    function current() {
        return colors[index]
    }
    return {
        next: next,
        current: current
    }
})();

function removeAnimation(animation) {
    var index = animations.indexOf(animation);
    if (index > -1) animations.splice(index, 1);
}

function calcPageFillRadius(x, y) {
    var l = Math.max(x - 0, cW - x);
    var h = Math.max(y - 0, cH - y);
    return Math.sqrt(Math.pow(l, 2) + Math.pow(h, 2));
}

function addClickListeners() {
    document.addEventListener("touchstart", handleEvent);
    document.addEventListener("mousedown", handleEvent);
};

function handleEvent(e) {
    if (e.touches) {
        e.preventDefault();
        e = e.touches[0];
    }
    var currentColor = colorPicker.current();
    var nextColor = colorPicker.next();
    var targetR = calcPageFillRadius(e.pageX, e.pageY);
    var rippleSize = Math.min(200, (cW * .4));
    var minCoverDuration = 750;

    var pageFill = new Circle({
        x: e.pageX,
        y: e.pageY,
        r: 0,
        fill: nextColor
    });
    var fillAnimation = anime({
        targets: pageFill,
        r: targetR,
        duration:  Math.max(targetR / 2 , minCoverDuration ),
        easing: "easeOutQuart",
        complete: function(){
            bgColor = pageFill.fill;
            removeAnimation(fillAnimation);
        }
    });

    var ripple = new Circle({
        x: e.pageX,
        y: e.pageY,
        r: 0,
        fill: currentColor,
        stroke: {
            width: 3,
            color: currentColor
        },
        opacity: 1
    });
    var rippleAnimation = anime({
        targets: ripple,
        r: rippleSize,
        opacity: 0,
        easing: "easeOutExpo",
        duration: 900,
        complete: removeAnimation
    });

    animations.push(fillAnimation, rippleAnimation);
}

function extend(a, b){
    for(var key in b) {
        if(b.hasOwnProperty(key)) {
            a[key] = b[key];
        }
    }
    return a;
}

var Circle = function(opts) {
    extend(this, opts);
}

Circle.prototype.draw = function() {
    ctx.globalAlpha = this.opacity || 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    if (this.stroke) {
        ctx.strokeStyle = this.stroke.color;
        ctx.lineWidth = this.stroke.width;
        ctx.stroke();
    }
    if (this.fill) {
        ctx.fillStyle = this.fill;
        ctx.fill();
    }
    ctx.closePath();
    ctx.globalAlpha = 1;
}

var animate = anime({
    duration: Infinity,
    update: function() {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, cW, cH);
        animations.forEach(function(anim) {
            anim.animatables.forEach(function(animatable) {
                animatable.target.draw();
            });
        });
    }
});

var resizeCanvas = function() {
    cW = window.innerWidth;
    cH = window.innerHeight;
    c.width = cW * devicePixelRatio;
    c.height = cH * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
};

(function init() {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    addClickListeners();
    document.getElementById('splash').classList.add('fadeInUp');
    setTimeout(function() {
        fauxClick(window.innerWidth/2,window.innerHeight/2);
        /*
        setTimeout((function() {
            document.getElementById('splash').classList.remove('fadeInUp');
            document.getElementById('splash').classList.add('fadeOutUp');
            document.getElementById('rooms').classList.add('fadeInUp');
        }),500) */
}, 500);

    document.getElementById("roomsLink").addEventListener("click", function (e) {
        document.getElementById('splash').classList.remove('fadeInUp');
        document.getElementById('splash').classList.add('fadeOutUp');
        document.getElementById('rooms').classList.add('fadeInUp');
    });
    document.getElementById("roomsToMenuLink").addEventListener("click", function (e) {
        document.getElementById('rooms').classList.remove('fadeInUp');
        document.getElementById('rooms').classList.add('fadeOutUp');
        document.getElementById('splash').classList.add('fadeInUp');
    });
    document.getElementById("controlsLink").addEventListener("click", function (e) {
        document.getElementById('splash').classList.remove('fadeInUp');
        document.getElementById('splash').classList.add('fadeOutUp');
        document.getElementById('controlsCard').classList.add('fadeInUp');
    });
    document.getElementById("controlsToMenuLink").addEventListener("click", function (e) {
        document.getElementById('controlsCard').classList.remove('fadeInUp');
        document.getElementById('controlsCard').classList.add('fadeOutUp');
        document.getElementById('splash').classList.add('fadeInUp');
    });
    document.getElementById("rulesLink").addEventListener("click", function (e) {
        document.getElementById('splash').classList.remove('fadeInUp');
        document.getElementById('splash').classList.add('fadeOutUp');
        document.getElementById('rulesCard').classList.add('fadeInUp');
    });
    document.getElementById("rulesToMenuLink").addEventListener("click", function (e) {
        document.getElementById('rulesCard').classList.remove('fadeInUp');
        document.getElementById('rulesCard').classList.add('fadeOutUp');
        document.getElementById('splash').classList.add('fadeInUp');
    });


})();

function fauxClick(x, y) {
    var fauxClick = new Event("mousedown");
    fauxClick.pageX = x;
    fauxClick.pageY = y;
    document.dispatchEvent(fauxClick);
}
