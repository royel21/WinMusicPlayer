const { renderer } = require('./modules/renderer');
const db = require('./models');
const os = require('os');
const getId = () => Math.random().toString(36).slice(-6);
const id3 = require('id3js');
var playlist = [];
var currentId;
var lastIds = [];

const nextAudio = (e) =>{
    let index = playlist.indexOf(currentId);
    if(++index < playlist.length){
        if($('#random-audio').is(':checked')){
            playAudio(playlist.randomFile());
        }else{
             playAudio(playlist[index]); 
        }
    }
}

const prevAudio = (e) =>{
    let index = playlist.indexOf(currentId);
    
    if(lastIds.length > 0){
        index = playlist.indexOf(lastIds.pop());
        playAudio(playlist[index], true);
    }else if(--index > -1){
        playAudio(playlist[index], true);
    }
}

ipcRenderer.on('error', (event, msg) => {
    console.log(msg)
});

const loadScript = (script) => {
    var loadedScript = document.createElement("script");
    loadedScript.id = 'pagescript';
    loadedScript.src = script;
    $('#pagescript').replaceWith(loadedScript);
}
const loadView = (id) => {
    lastIds = [];
    let $container = $('#container');
    let script = "./public/js/";
    switch (id) {
        case "tab-playing": {
            db.audiofile.findAll({ order: ['NameNormalize'] }).then(files => {
                if(files){
                    playlist = files.map(f => f.Id);
                }else{
                    files = [];
                }
                $container.empty().append(renderer('playlist', { files }));
                loadScript(script + "playlist.js");
            });
            break;
        }
        case "tab-list": {
            $container.empty();
            loadScript(script + "list.js");
            break;
        }
        case "tab-all": {
            $container.empty();
            loadScript(script += "allfile.js");
            break;
        }
        case "tab-folders": {
            $container.empty().append(renderer('items_home', { title1: "List A", list1: { count: 0 }, title2: "listB", list2: { count: 0 } }));
            loadScript(script + "folders.js");
            break;
        }
        case "tab-shedules": {
            $container.empty();
            script += "shedules.js";
            break;
        }
        case "tab-directories": {
            $container.empty().append(renderer('directories'));
            loadScript(script + "directories.js");
            break;
        }
    }
}
$('.nav-tabs input[type=radio]').change((e) => {
    let id = e.target.id;
    console.log(id);
    loadView(id);
});

/********************************* Player ********************************************************* */

let volcontrol = document.getElementById('vol-slider');
let btnPlay = document.getElementById('v-play');
let btnMuted = document.getElementById('v-mute');
let player = document.getElementById('player');
let $vTotalTime = $('#v-total-time');
let update = false;
let vDuration;

Slider = new SliderRange('#slider-container');
Slider.min = 0;
Slider.value = 0;
Slider.max = 1;
Slider.setPreviewContent($('<span id="v-current-time">'));

Slider.onPreview = (value) => {
    $('#v-current-time').text(formatTime(Math.floor(value)));
}

player.onloadedmetadata = function (e) {
    Slider.min = 0;
    Slider.max = player.duration;
    Slider.value = 0;
    update = true;
    vDuration = formatTime(player.duration);
    $('#v-total-time').text(formatTime(0) + '/' + vDuration);
}

Slider.oninput = (value) => {
    player.currentTime = value;
}


volcontrol.oninput = (e) => {
    player.volume = volcontrol.value;
}
const pauseOrPlay = () => {
    var playPause = "Pausar";
    if (player.paused) {
        player.play().catch(e => { });
    } else {
        player.pause();
        playPause = "Reproducir";

    }
    $('#video-viewer .fa-play-circle').attr('data-title', playPause);

    btnPlay.checked = player.paused;
}
btnPlay.onchange = pauseOrPlay;

player.ontimeupdate = (e) => {
    if (update && Slider) {
        Slider.value = Math.floor(player.currentTime);
        $vTotalTime.text(formatTime(player.currentTime) + "/" + vDuration);
    }
}
player.onvolumechange = function (e) {
    if (update) {
        volcontrol.value = player.volume;
        volcontrol.setAttribute('value', player.volume);
    }
    btnMuted.onchange = () => {
        player.muted = btnMuted.checked;
        $('.fa-volume-up').attr('data-title', btnMuted.checked ? "No Silenciar" : "Silenciar");
    }
}

player.onended = nextAudio;

const playAudio = async (Id, prev) => {
    if(!prev && !lastIds.find(id=> id === Id)) lastIds.push(currentId);
    currentId = Id;
    selectListRow($('#'+Id));
    let file = await db.audiofile.findOne({
        where: { Id },
        include: { model: db.directory }
    });
    if(file){
        let audPath = path.join(file.Directory.Path, file.Name);
        player.src = audPath;
    }
}

$('#v-next').click(nextAudio);
$('#v-prev').click(prevAudio);
/************************************************************************************************* */
$(() => {
    let directories = [{ id: getId(), path: path.join(os.homedir(), 'Music') }];
    if (!local.getObject('directories')) {
        local.setObject('directories', directories);
    }
    db.init().then(() => {
        createBackgroundWin('scan-dirs');
        loadView('tab-playing');
    });
});