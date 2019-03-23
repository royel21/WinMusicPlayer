const { renderer } = require('./modules/renderer');
const db = require('./models');
const os = require('os');
const getId = () => Math.random().toString(36).slice(-6);
const id3 = require('id3js');

const btnShuffler = document.getElementById('random-audio');

const getSelectedId = () => $('#list-a .active').attr('id');

var config = {
    volume: 0.5,
    shuffle: false,
    rewind: false,
    playList: [],
    directories: [{ id: getId(), path: path.join(os.homedir(), 'Music') }],
    currentFile: { Id: 0, Name: "", Path: "" }
}

ipcRenderer.on('save-file', (e) => {
    local.setObject('config', config);
    ipcRenderer.send('close', "");
});

const getFileList = async (data) => {
    return await db.sqlze.query(`Select Id, Name, NameNormalize 
        from Files where Name LIKE ? and Id ${data.not} in(Select FileId 
        from FileLists where ListId = ?) 
        ORDER BY NameNormalize;`,
        {
            model: db.File,
            mapToModel: true,
            replacements: [data.val, data.Id],
            type: db.sqlze.QueryTypes.SELECT
        });
}

const getIndex = (file) => config.playList.findIndex(f => f.Id === file.Id);

const nextAudio = (e) => {
    let index = getIndex(config.currentFile);
    if (++index < config.playList.length) {
        playAudio(config.playList[index]);
    }else{
        playAudio(config.playList[0]);
    }
}

const prevAudio = (e) => {
    let index = getIndex(config.currentFile);
    if (--index > -1 && index < config.playList.length) {
        playAudio(config.playList[index]);
    }else{
        playAudio(config.playList[config.playList.length-1]);
    }
}

ipcRenderer.on('reload', (event, msg) => {
   let id = $('#nav-menu input[type=radio]:checked').id;
    console.log('reload:', id);
    loadView(id);
});

ipcRenderer.on('error', (event, msg) => {
    console.log(msg);
    ipcRenderer.send('console-log', msg);
});

const loadPlayList = async (files) =>{
    config.playList = files.map(f => {
        return {
            Id: f.Id,
            Name: f.Name,
            Path: f.Directory.Path
        }
    });
     if (btnShuffler.checked) {
        config.playList.shuffle();
     }
}

const loadScript = (script) => {
    var loadedScript = document.createElement("script");
    loadedScript.id = 'pagescript';
    loadedScript.src = script;
    $('#pagescript').replaceWith(loadedScript);
}

const loadView = (id) => {
    delete listConfig;
    delete foldersConfig;
    delete playingConfig;
    delete taskConfig;
    delete directoriesConfig;
    delete loadAllFilesConfig;

    config.lastIds = [];
    let $container = $('#container');
    let script = "./public/js/";
    switch (id) {
        case "tab-playing": {
                $container.empty().append(renderer('playing', { files: config.playList }));
                loadScript(script + "playing.js");
            break;
        }
        case "tab-list": {
           db.list.findAll().then(lists=> {
                let files  = [];
                if (lists.length > 0) {
                    files = getFileList({val:"", Id: lists[0].Id, not: ''});
                }
                $container.empty().append(renderer('playlist', { lists, files }));
                $('#list-a li:first-child').addClass('active');
                $('#list-b li:first-child').addClass('active');
                loadScript(script + "playlist.js");
            });
            break;
        }
        case "tab-all": {
            db.file.findAll({include: {model: db.directory}}).then(files=> {
                $container.empty().append(renderer('allfiles', { files }));
                $('#list-a li:first-child').addClass('active');
                loadScript(script += "allfiles.js");
                loadPlayList(files);
            });
            break;
        }
        case "tab-folders": {
            db.directory.findAndCountAll({ include: { model: db.file } }).then(listA => {
                let listB = { count: 0, rows: [] };
                if (listA.rows[0]) {
                    listB.rows = listA.rows[0].Files
                }
                $container.empty().append(renderer('folders', { title1: "List A", listA, title2: "listB", listB }));
                $('#list-a li:first-child').addClass('active');
                $('#list-b li:first-child').addClass('active');
                loadScript(script + "folders.js");
            });
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

$('#nav-menu input[type=radio]').change((e) => {
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
Slider.max = 0;
Slider.setPreviewContent($('<span id="v-current-time">'));

Slider.onPreview = (value) => {
    $('#v-current-time').text(formatTime(Math.floor(value)));
}

player.onloadedmetadata = function (e) {
    Slider.min = 0;
    Slider.max = player.duration;
    Slider.value = 0;
    vDuration = formatTime(player.duration);
    $('#v-total-time').text(formatTime(0) + '/' + vDuration);
    update = true;
}

Slider.oninput = (value) => {
    player.currentTime = value;
}

volcontrol.oninput = (e) => {
    player.volume = config.volume = volcontrol.value;
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
    if (player.src === "") {
        if (config.currentFile.Id !== 0) {
            playAudio(config.currentFile);
        } else {
            playAudio(config.playList[0]);
        }
    }
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
        volcontrol.value = config.volume = player.volume;
        volcontrol.setAttribute('value', player.volume);
    }
}

btnMuted.onchange = () => {
    player.muted = btnMuted.checked;
    $('.fa-volume-up').attr('data-title', btnMuted.checked ? "No Silenciar" : "Silenciar");
}

player.onended = nextAudio;

// document.onkeydown = (e) => {
//     console.log(e.keyCode)
//     if (player.duration) {
//         player.currentTime =  e.keyCode === 39 ? ++player.currentTime : --player.currentTime;
//         e.preventDefault();
//     }
// }

const playAudio = async (file, prev) => {

    config.currentFile = file;
    selectListRow($('#' + file.Id));
    if (file) {
        player.src = path.join(file.Path, file.Name);
    }
}

$('#v-next').click(nextAudio);
$('#v-prev').click(prevAudio);

btnShuffler.onchange = (e) => {
    config.shuffle = btnShuffler.checked;
    if (btnShuffler.checked) {
        config.playList.shuffle();
    } else {
        db.file.findAll({
            order: ['NameNormalize'],
            include: { model: db.directory }
        }).then(files => {
            config.playList = files.map(f => {
                return {
                    Id: f.Id,
                    Name: f.Name,
                    Path: f.Directory.Path
                }
            });
        })
    }
}

/************************************************************************************************* */
$(() => {
    let tempConfig = local.getObject('config');
    if (tempConfig) {
        config = tempConfig;
    }
    player.volume = volcontrol.value = config.volume;
    btnShuffler.checked = config.shuffle;

    db.init().then(() => {
        createBackgroundWin('scan-dirs');
        loadView('tab-playing');
    });
});

/****************list share code****************************/

selectListRow = ($el) => {
    if ($el[0]) {
        $el.closest('.list-container').find('li').removeClass('active');
        $el.addClass('active');
        $el.focus();
    }
}

$('#container').on('click', '.list-container li', (e) => selectListRow($(e.target.closest('li'))));

$('#container').on('keydown', 'ul li', (e) => {
    let $item = $(e.target.closest('ul')).find('.active');
    console.log(e.keyCode);
    switch (e.keyCode) {
        case 38:
            {
                selectListRow($item.prev());
                e.stopPropagation();
                event.preventDefault();
                break;
            }

        case 40:
            {
                selectListRow($item.next());
                e.stopPropagation();
                event.preventDefault();
                break;
            }
    }
});
