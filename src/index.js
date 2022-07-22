const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

var $ = jQuery = require("jquery");

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const beep = (fraquency, duration) => {
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.value = 1; // volume
    oscillator.frequency.value = fraquency;
    oscillator.type = 'sawtooth'; // type

    oscillator.start();

    setTimeout(
        function () {
            oscillator.stop();
        },
        duration
    );
};

var connected = false;
var started = false;

/*!
    *speedometer.js
    *author: Manivannan R
    *project: Speedometer
*/
$.fn.speedometer = function (userPref) {
    var self = this;
    this.defaultProperty = {
        maxVal: 180,         /**Max value of the meter*/
        divFact: 10,          /**Division value of the meter*/
        dangerLevel: 120,         /**more than this leval, color will be red*/
        initDeg: -45,         /**reading begins angle*/
        maxDeg: 270,         /**total angle of the meter reading*/
        edgeRadius: 150,         /**radius of the meter circle*/
        speedNobeH: 4,           /**speed nobe height*/
        speedoNobeW: 95,          /**speed nobe width*/
        speedoNobeL: 13,          /**speed nobe left position*/
        indicatorRadius: 125,         /**radius of indicators position*/
        indicatorNumbRadius: 90,          /**radius of numbers position*/
        speedPositionTxtWH: 80,          /**speedo-meter current value cont*/
        nobW: 20,          /**indicator nob width*/
        nobH: 4,           /**indicator nob height*/
        numbW: 30,          /**indicator number width*/
        numbH: 16,          /**indicator number height*/
        midNobW: 10,          /**indicator mid nob width*/
        midNobH: 3,           /**indicator mid nob height*/
        noOfSmallDiv: 2,           /**no of small div between main div*/
        eventListenerType: 'change',    /**type of event listener*/
        multiplier: 1,	       /**Center value multiplier e.g. 1 x 1000 RPM*/
        gagueLabel: 'km/h'       /**Label on guage Face*/
    }
    if (typeof userPref === 'object')
        for (var prop in userPref) this.defaultProperty[prop] = userPref[prop];

    var speedInDeg,
        noOfDev = this.defaultProperty.maxVal / this.defaultProperty.divFact,
        divDeg = this.defaultProperty.maxDeg / noOfDev,
        speedBgPosY,
        speedoWH = this.defaultProperty.edgeRadius * 2,
        speedNobeTop = this.defaultProperty.edgeRadius - this.defaultProperty.speedNobeH / 2,
        speedNobeAngle = this.defaultProperty.initDeg,
        speedPositionTxtTL = this.defaultProperty.edgeRadius - this.defaultProperty.speedPositionTxtWH / 2,
        tempDiv = '',
        induCatorLinesPosY, induCatorLinesPosX, induCatorNumbPosY, induCatorNumbPosX,
        induCatorLinesPosLeft, induCatorLinesPosTop, induCatorNumbPosLeft, induCatorNumbPosTop;

    this.setCssProperty = function () {
        var tempStyleVar = [
            '<style>',
            '#' + this.parentElemId + ' .envelope{',
            'width  :' + speedoWH + 'px;',
            'height :' + speedoWH + 'px;',
            '}',
            '#' + this.parentElemId + ' .speedNobe{',
            'height            :' + this.defaultProperty.speedNobeH + 'px;',
            'top               :' + speedNobeTop + 'px;',
            'transform         :rotate(' + speedNobeAngle + 'deg);',
            '-webkit-transform :rotate(' + speedNobeAngle + 'deg);',
            '-moz-transform    :rotate(' + speedNobeAngle + 'deg);',
            '-o-transform      :rotate(' + speedNobeAngle + 'deg);',
            '}',
            '#' + this.parentElemId + ' .speedPosition{',
            'width  :' + this.defaultProperty.speedPositionTxtWH + 'px;',
            'height :' + this.defaultProperty.speedPositionTxtWH + 'px;',
            'top  :' + speedPositionTxtTL + 'px;',
            'left :' + speedPositionTxtTL + 'px;',
            '}',
            '#' + this.parentElemId + ' .speedNobe div{',
            'width  :' + this.defaultProperty.speedoNobeW + 'px;',
            'left :' + this.defaultProperty.speedoNobeL + 'px;',
            '}',
            '#' + this.parentElemId + ' .nob{',
            'width  :' + this.defaultProperty.nobW + 'px;',
            'height :' + this.defaultProperty.nobH + 'px;',
            '}',
            '#' + this.parentElemId + ' .numb{',
            'width  :' + this.defaultProperty.numbW + 'px;',
            'height :' + this.defaultProperty.numbH + 'px;',
            '}',
            '#' + this.parentElemId + ' .midNob{',
            'width  :' + this.defaultProperty.midNobW + 'px;',
            'height :' + this.defaultProperty.midNobH + 'px;',
            '}',
            '</style>',
        ].join('');
        this.parentElem.append(tempStyleVar);
    }
    this.creatHtmlsElecments = function () {
        this.parentElemId = 'speedometerWraper-' + $(this).attr('id');
        $(this).wrap('<div id="' + this.parentElemId + '">');
        this.parentElem = $(this).parent();
        this.setCssProperty();
        this.createIndicators();
    }
    this.createIndicators = function () {
        for (var i = 0; i <= noOfDev; i++) {
            var curDig = this.defaultProperty.initDeg + i * divDeg;
            var curIndVal = i * this.defaultProperty.divFact;
            var dangCls = "";
            if (curIndVal >= this.defaultProperty.dangerLevel) {
                dangCls = "danger";
            }
            var induCatorLinesPosY = this.defaultProperty.indicatorRadius * Math.cos(0.01746 * curDig);
            var induCatorLinesPosX = this.defaultProperty.indicatorRadius * Math.sin(0.01746 * curDig);

            var induCatorNumbPosY = this.defaultProperty.indicatorNumbRadius * Math.cos(0.01746 * curDig);
            var induCatorNumbPosX = this.defaultProperty.indicatorNumbRadius * Math.sin(0.01746 * curDig);

            if (i % this.defaultProperty.noOfSmallDiv == 0) {
                induCatorLinesPosLeft = (this.defaultProperty.edgeRadius - induCatorLinesPosX) - 2;
                induCatorLinesPosTop = (this.defaultProperty.edgeRadius - induCatorLinesPosY) - 10;
                var tempDegInd = [
                    'transform         :rotate(' + curDig + 'deg)',
                    '-webkit-transform :rotate(' + curDig + 'deg)',
                    '-o-transform      :rotate(' + curDig + 'deg)',
                    '-moz-transform    :rotate(' + curDig + 'deg)',
                ].join(";");
                tempDiv += '<div class="nob ' + dangCls + '" style="left:' + induCatorLinesPosTop + 'px;top:' + induCatorLinesPosLeft + 'px;' + tempDegInd + '"></div>';
                induCatorNumbPosLeft = (this.defaultProperty.edgeRadius - induCatorNumbPosX) - (this.defaultProperty.numbW / 2);
                induCatorNumbPosTop = (this.defaultProperty.edgeRadius - induCatorNumbPosY) - (this.defaultProperty.numbH / 2);
                tempDiv += '<div class="numb ' + dangCls + '" style="left:' + induCatorNumbPosTop + 'px;top:' + induCatorNumbPosLeft + 'px;">' + curIndVal + '</div>';
            } else {
                induCatorLinesPosLeft = (this.defaultProperty.edgeRadius - induCatorLinesPosX) - (this.defaultProperty.midNobH / 2);
                induCatorLinesPosTop = (this.defaultProperty.edgeRadius - induCatorLinesPosY) - (this.defaultProperty.midNobW / 2);
                var tempDegInd = [
                    'transform         :rotate(' + curDig + 'deg)',
                    '-webkit-transform :rotate(' + curDig + 'deg)',
                    '-o-transform      :rotate(' + curDig + 'deg)',
                    '-moz-transform    :rotate(' + curDig + 'deg)',
                ].join(";");
                tempDiv += '<div class="nob ' + dangCls + ' midNob" style="left:' + induCatorLinesPosTop + 'px;top:' + induCatorLinesPosLeft + 'px;' + tempDegInd + '"></div>';
                tempDiv += '<div class="numb"></div>';
            }
        }
        this.parentElem.append('<div class="envelope">');

        var speedNobe = [
            '<div class="speedNobe">',
            '<div></div>',
            '</div>',
            '<div class="speedPosition"></div>'
        ].join();

        this.parentElem.find(".envelope").append(speedNobe + tempDiv);
    }
    this.changePosition = function () {
        // console.log($(this).val())
        var speed = $(this).val();
        if (speed > self.defaultProperty.maxVal) {
            speed = self.defaultProperty.maxVal;
        }
        if (speed < 0 || isNaN(speed)) {
            speed = 0;
        }
        speedInDeg = (self.defaultProperty.maxDeg / self.defaultProperty.maxVal) * speed + self.defaultProperty.initDeg;

        self.parentElem.find(".speedNobe").css({
            "-webkit-transform": 'rotate(' + speedInDeg + 'deg)',
            "-webkit-transform": 'rotate(' + speedInDeg + 'deg)',
            "-moz-transform": 'rotate(' + speedInDeg + 'deg)',
            "-o-transform": 'rotate(' + speedInDeg + 'deg)'
        });

        var centerVal = speed * self.defaultProperty.multiplier;
        self.parentElem.find(".speedPosition").html(centerVal + "<br />" + self.defaultProperty.gagueLabel);

        self.parentElem.find(".envelope .nob,.envelope .numb").removeClass("bright");
        for (var i = 0; i <= noOfDev; i++) {
            if (speed >= i * self.defaultProperty.divFact) {
                self.parentElem.find(".envelope .nob").eq(i).addClass("bright");
                self.parentElem.find(".envelope .numb").eq(i).addClass("bright");
            } else {
                break;
            }
        }
    }
    this.creatHtmlsElecments();
    $(this).bind(this.defaultProperty.eventListenerType, this.changePosition);
    return this;
}
////////  

document.addEventListener('DOMContentLoaded', function () {
    $('#connect-btn').on('click', () => {
        ipcRenderer.send('on-start-click', 'do-it');
    });
    $('#btn').on('click', () => {
        ipcRenderer.send('on-restart-click', 'do-it');
    });
    $('#video').trigger('play');
    $('#video').on('ended', () => {
        $('#splash').hide();
    });

    $('#output-container').hide();

    $("#gauge-1").speedometer({
        divFact: 10,
        eventListenerType: 'keyup',
        maxVal: 200,
        dangerLevel: 140,
        gagueLabel: 'km/h',
    });
    $("#gauge-2").speedometer({
        divFact: 10,
        eventListenerType: 'keyup',
        maxVal: 200,
        dangerLevel: 140,
        gagueLabel: 'km/h',
    });

    document.onkeydown = function (evt) {
        evt = evt || window.event;
        var isEscape = false;
        var isDev = false;
        var isRestart = false;
        if ("key" in evt) {
            isEscape = (evt.key === "Escape" || evt.key === "Esc");
            isDev = (evt.ctrlKey && evt.shiftKey && evt.key === "I");
            isRestart = (evt.ctrlKey && evt.shiftKey && evt.key === "R");
        } else {
            isEscape = (evt.keyCode === 27);
            isDev = (evt.ctrlKey && evt.shiftKey && evt.keyCode === 73);
            isRestart = (evt.ctrlKey && evt.shiftKey && evt.keyCode === 82);
        }
        if (isEscape) {
            ipcRenderer.send('on-go-back', 'do-it');
        }
        if (isDev) {
            ipcRenderer.send('on-dev-click', 'do-it');
        }
        if (isRestart) {
            ipcRenderer.send('on-restart-click', 'do-it');
        }
    };
});

ipcRenderer.on('on-serial-open', () => {
    connected = true;
    $('#connect-btn').hide();
    // $('#stop-btn').on('click', () => {
    //     ipcRenderer.send('on-stop-click', 'do-it');
    // });
    $('#status').text('Connected');
    $('#first').hide();
    $('#output-container').show();
    // $('#gauges-container').hide();
    $('#modal').hide();
    $('#play-btn').on('click', () => onStartClick());
    // $('#stop-btn').on('click', () => {
    //     started = false;
    //     ipcRenderer.send('on-stop-device-click', 'do-it');
    // });
});

ipcRenderer.on('on-device-start-click', () => {
    console.log('on-device-start-click');
    if (started) {
        return;
    }
    onStartClick();
});

ipcRenderer.on('on-serial-close', () => {
    connected = false;
    $('#connect-btn').show();
    $('#status').text('Not Connected');
    $('#first').hide();
    $('#output-container').hide();
    $('#play-btn').show();
    // $('#gauges-container').hide();
    $('#modal').hide();
});

ipcRenderer.on('on-serial-data', (_event, data) => {
    if (!started) {
        return;
    }
    $('#output-container').show();
    $('#play-btn').hide();
    $('#gauges-container').show();
    console.log("on-serial-data:", data);
    // data = data / 1.8;
    data = data / 1.0;
    // convert to int
    data = parseInt(data);
    finalReadingUser = data;
    $("#gauge-1").val(data);
    $("#gauge-1").trigger('keyup');
    //$('.data').text(data);
    if (data != 0 && data >= finalReadingRobot) {
        finalReadingUser = data;
    } else {
        finalReadingUser = finalReadingUser;
    }
    if (data >= 201) {
        stop();
    }
});

function onStartClick() {
    if (started) {
        return;
    }
    started = true;

    setTimeout(() => {
        $('#play-btn').text('3');
        beep(4210, 250);
        setTimeout(() => {
            $('#play-btn').text('2');
            beep(4210, 250);
            setTimeout(() => {
                $('#play-btn').text('1');
                beep(4210, 250);
                setTimeout(() => {
                    $('#play-btn').text('Start');
                    $('#play-btn').hide();
                    // $('#gauges-container').show();
                    ipcRenderer.send('on-start-device-click', 'do-it');
                    beep(2310, 500);
                    start();
                }, 1000);
            }, 1000);
        }, 1000);
    }, 1000);
}

var robot_rotation = 0;
var startRace;
var finalReadingRobot = 0;
var finalReadingUser = 0;

function start() {
    $('#bg-div').show();
    // $('#gauges-container').css('position', 'absolute');
    // $('#gauges-container').css('top', '10vh');
    // // load the video from assets using jquery
    // $('#leopard-video').attr('src', 'assets/leopard-3.mp4');
    // $('#leopard-video').get(0).play();
    // increase video playback speed
    // $('#leopard-video').get(0).playbackRate = 1.5;
    // // $('#leopard-video').on('ended', () => {
    // //     $('#leopard-video').attr('src', 'assets/leopard-2.mp4');
    // //     $('#leopard-video').get(0).play();
    // // });
    // $('#leopard-video').show();

    finalReadingRobot = 0;
    finalReadingUser = 0;
    robot_rotation = 0;
    //
    startRace = setInterval(() => {
        robot_rotation = robot_rotation + 1;
        if (robot_rotation != 0 && (robot_rotation >= finalReadingRobot)) {
            finalReadingRobot = robot_rotation;
        } else {
            finalReadingRobot = finalReadingRobot;
        }
        if (robot_rotation == 201) {
            stop();
        } else {
            $("#gauge-2").val(robot_rotation);
            $("#gauge-2").trigger('keyup');
        }
    }, 150);


}

function stop() {
    if (startRace) {
        clearInterval(startRace);
    }
    $("#gauge-1").val(0);
    $("#gauge-1").trigger('keyup');
    $("#gauge-2").val(0);
    $("#gauge-2").trigger('keyup');
    // $('#gauges-container').css('position', 'relative');
    // $('#gauges-container').css('top', '20px');

    if ((finalReadingRobot > finalReadingUser) && (finalReadingUser == 201 || finalReadingRobot == 201)) {
        $('#modal-text').text('You Lose');
        $('#loser-img').show();
        $('#winner-img').hide();
        $('#modal').show();
        beep(500, 500);
        setTimeout(() => {
            $('#modal').hide();
        }, 3000);
    }
    if ((finalReadingRobot < finalReadingUser) && (finalReadingUser == 201 || finalReadingRobot == 201)) {
        $('#modal-text').text('You Win');
        $('#winner-img').show();
        $('#loser-img').hide();
        $('#modal').show();
        beep(5000, 500);
        setTimeout(() => {
            $('#modal').hide();
        }, 3000);
    }
    $('#bg-div').hide();
    // // stop the video
    // // $('#leopard-video').get(0).pause();
    // // also reset the video to the first frame
    // // $('#leopard-video').get(0).currentTime = 0;
    // // hide the video
    // // $('#leopard-video').hide();

    started = false;
    ipcRenderer.send('on-stop-device-click', 'do-it');
    // show play button
    $('#play-btn').show();
}