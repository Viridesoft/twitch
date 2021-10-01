var loadingEle = $('.loading');
var loading_width = loadingEle.width(),
    loading_height = loadingEle.height();

(function($) {

    function drawSin(xOffset, color1, color2) {
        var config = this.data('waterBall').config;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = config.cvs_config.width;
        canvas.height = config.cvs_config.height;
        ctx.save();
        var points = [];
        ctx.beginPath();
        ctx.arc(config.circle_config.r, config.circle_config.r, config.circle_config.cR - 5, 0, 2 * Math.PI);
        ctx.clip();
        ctx.closePath();
        ctx.beginPath();
        var w_sX = config.wave_config.sX,
            w_waveWidth = config.wave_config.waveWidth,
            w_waveHeight = config.wave_config.waveHeight,
            w_axisLength = config.wave_config.axisLength,
            c_width = config.cvs_config.width,
            c_height = config.cvs_config.height;

        for (var x = w_sX; x < w_sX + w_axisLength; x += 20 / w_axisLength) {
            var y = -Math.sin((w_sX + x) * w_waveWidth + xOffset);

            var dY = c_height * (1 - config.nowRange / 100);

            points.push([x, dY + y * w_waveHeight]);
            ctx.lineTo(x, dY + y * w_waveHeight);
        }
        ctx.lineTo(w_axisLength, c_height);
        ctx.lineTo(w_sX, c_height);
        ctx.lineTo(points[0][0], points[0][1]);

        var gradient = ctx.createLinearGradient(0, c_height, c_width, points[points.length - 1][1]);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);

        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();

        ctx.save();
        var size = 0.4 * config.circle_config.cR;
        ctx.font = size + 'px Microsoft Yahei';
        ctx.textAlign = 'center';
        ctx.fillStyle = "#000";
        ctx.fillText(~~config.nowRange + '%', config.circle_config.r, config.circle_config.r + size / 2);
        ctx.restore();
        return canvas;
    }

    function drawCircle() {
        var config = this.data('waterBall').config;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = config.cvs_config.width;
        canvas.height = config.cvs_config.height;
        ctx.lineWidth = config.lineWidth;
        ctx.beginPath();
        ctx.strokeStyle = getColor(config.nowRange);
        ctx.arc(config.circle_config.r, config.circle_config.r, config.circle_config.cR, 0, 2 * Math.PI);
        ctx.stroke();
        return canvas;
    }

    var methods = {
        init: function(config) {

            return this.each(function() {

                var $this = $(this),
                    data = $this.data('waterBall'),
                    _config = {
                        cvs_config: {
                            width: 220,
                            height: 220
                        },
                        wave_config: {
                            sX: 0,
                            sY: 220 / 2,
                            waveWidth: 0.015,
                            waveHeight: 5,
                            axisLength: 220,
                            speed: 0.09,
                            xOffset: 0
                        },
                        circle_config: {
                            r: 220 / 2,
                            cR: 220 / 2 - 5
                        },
                        nowRange: 0,
                        targetRange: 0,
                        lineWidth: 2,
                    };
                if (!data) {
                    var wave_config = {},
                        circle_config = {};
                    if (config.cvs_config) {
                        wave_config = {
                            sY: config.cvs_config.width / 2,
                            axisLength: config.cvs_config.width
                        };
                        circle_config = {
                            r: config.cvs_config.width / 2,
                            cR: config.cvs_config.width / 2 - 5
                        };
                    }

                    $.extend(true, _config, {
                        wave_config: wave_config,
                        circle_config: circle_config
                    }, config);
                    var canvas = document.createElement('canvas');
                    canvas.width = _config.cvs_config.width;
                    canvas.height = _config.cvs_config.height;
                    $this.html("").html($(canvas));
                    $this.data('waterBall', {
                        canvas: canvas,
                        target: $this,
                        config: _config
                    });
                    methods.render.apply($this);
                }
            });

        },
        destroy: function() {},
        updateRange: function(newVal) {
            return this.each(function() {
                var $this = $(this),
                    data = $this.data('waterBall');
                if (!data) return;
                var config = $this.data('waterBall').config;
                config.targetRange = 0;
                //config.nowRange = 0;
                config.isLoading = false;
                setTimeout(function() {
                    config.targetRange = newVal;
                }, 0);
            });
        },
        render: function() {
            var config = this.data('waterBall').config;
            var _canvas = this.data('waterBall').canvas;
            var w_sX = config.wave_config.sX,
                xOffset = config.wave_config.xOffset,
                bg_color1 = getColor(config.nowRange, 30),
                bg_color2 = getColor(config.nowRange - 2, 30),
                main_bg_color1 = getColor(config.nowRange),
                main_bg_color2 = getColor(config.nowRange - 2),
                ctx = _canvas.getContext('2d');

            var cvs1 = drawCircle.call(this);

            if (config.nowRange <= config.targetRange) {
                var tmp = 1;
                config.nowRange += tmp;
            }

            if (config.nowRange > config.targetRange) {
                var tmp = 1;
                config.nowRange -= tmp;
            }
            var cvs2 = drawSin.call(this, xOffset + 40, bg_color1, bg_color2);
            var cvs3 = drawSin.call(this, -40 + xOffset, main_bg_color1, main_bg_color2);
            ctx.clearRect(0, 0, config.cvs_config.width, config.cvs_config.height);
            ctx.drawImage(cvs1, 0, 0);
            ctx.drawImage(cvs2, 0, 0);
            ctx.drawImage(cvs3, 0, 0);
            delete cvs1;
            delete cvs2;
            delete cvs3;

            config.wave_config.xOffset += config.wave_config.speed;
            requestAnimationFrame(methods.render.bind(this));
        }
    };

    $.fn.createWaterBall = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + 'does not exits on jQuery.createWaterBall');
        }
    };
    $.fn.updateWaterBall = function(newValue) {
        methods["updateRange"](newValue);
    }
})(jQuery);


/*----- Viridesoft code -----*/
// GET COLOR IN HSL VALUE
function getColor(value, l = 50) {
    if (value > 100) { //maximum 100%
        value = 100;
    }
    value /= 100;
    var hue = ((value) * 120).toString(10);
    return "hsl(" + hue + ",100%," + l + "%)";
}

/*----- Streamlabs OBS code -----*/

document.addEventListener('goalLoad', function(obj) {
    let current = obj.detail.amount.current;
    let total = obj.detail.amount.target;
    let percentage = 100 * current / total;
    setValue(percentage);
});

document.addEventListener('goalEvent', function(obj) {
    // obj.detail will contain information about the goal
    let current = obj.detail.amount.current;
    let total = obj.detail.amount.target;
    let percentage = 100 * current / total;
    updateValue(percentage);
});

function setValue(value) {
    $('.loading').createWaterBall({
        cvs_config: {
            width: loading_width,
            height: loading_height
        },
        wave_config: {
            waveWidth: 0.02,
            waveHeight: 5
        },
        nowRange: value,
        targetRange: value
    });
}

function updateValue(value) {
    $('.loading').createWaterBall('updateRange', value);
}