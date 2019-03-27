$('#always-on-top').change(e=>{
   setAlwaysOnTop(e.target.checked); 
});

const { renderer } = require('./modules/renderer');
const db = require('./models');
const os = require('os');
const getId = () => Math.random().toString(36).slice(-6);
const id3 = require('id3js');

const btnShuffler = document.getElementById('random-audio');

const getSelectedId = () => $('#list-a .active').attr('id');

const $container = $('#container');

var playList;
var OriginalPlayList;
const itemPerPage = 500;

var config = {
    volume: 0.5,
    shuffle: false,
    rewind: false,
    currentFile: { Id: 0, Name: "", current: 0 }
}

const savePlayList = async () => {
    await player.pause();
    let list = await db.list.findOne({where: {Name: "Playing"}});
//     await db.sqlze.query(`Delete from FileLists where ListId = ${list.Id}`);
//     let files = await db.file.findAll({where:{id: OriginalPlayList}});
    await list.addFiles(OriginalPlayList);
}

ipcRenderer.on('save-file', (e) => {
    local.setObject('config', config);
    savePlayList().then(() => ipcRenderer.send('close', ""));
});


ipcRenderer.on('reload', (event, msg) => {
    let id = $('#nav-menu input[type=radio]:checked').id;
    console.log('reload:', id);
    loadView(id);
});

ipcRenderer.on('error', (event, msg) => {
    console.log(msg);
    ipcRenderer.send('console-log', msg);
});


ipcRenderer.on('scan', (event, data) => {
    console.log("scan: ", data.time)
    if (data.done) {
        $('#' + data.Id).find('.fa-sync').removeClass('fa-spin');
    }
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

const getIndex = (file) => playList.findIndex(f => f === file.Id);

const nextAudio = (e) => {
    let index = getIndex(config.currentFile);
    if (++index < playList.length) {
        playAudio(playList[index]);
    } else {
        playAudio(playList[0]);
    }
}

const prevAudio = (e) => {
    let index = getIndex(config.currentFile);
    if (--index > -1 && index < playList.length) {
        playAudio(playList[index]);
    } else {
        playAudio(playList[playList.length - 1]);
    }
}

const loadPlayList = (files) => {
    OriginalPlayList = files;
    playList = [...OriginalPlayList];
    if (btnShuffler.checked) {
        playList.shuffle();
    }
}

const loadScript = (script) => {
    var loadedScript = document.createElement("script");
    loadedScript.id = 'pagescript';
    loadedScript.src = "./public/js/" + script;
    $('#pagescript').replaceWith(loadedScript);
}

var myList;

const loadAllFiles = async (page, search) => {
    console.time('start');
    let begin = ((page - 1) * itemPerPage);
    let items = await db.file.findAndCountAll({
        order: ['NameNormalize'],
        offset: begin,
        limit: itemPerPage,
        where: { Name: { [db.Op.like]: "%" + (search || "") + "%" } },
        attribute:['Id', 'Name', 'NameNormalize']
    });

    let totalPages = Math.ceil(items.count / itemPerPage);

    $container.empty().append(renderer('allfiles', { files: items, pages: { currentPage: page, totalPages, search } }));

    loadScript("allfiles.js");

    $('#list-a li:first-child').addClass('active');

    const play = (e) =>{
        let id = e.target.closest('li').id;
        let filter = $('.search-input').val();
        db.file.findAll({
            order: ['NameNormalize'],
            where: { Name: { [db.Op.like]: "%" + filter + "%" } },
            attribute:['Id', 'NameNormalize']
        }).then(files=>{
            loadPlayList(files.map(f=>f.Id));
            playAudio(id);
        });
    }

    loadAllFilesConfig(loadAllFiles, play);
    console.timeEnd('start');
}

loadPlayListView = async (page, search) => {
    let count = OriginalPlayList.length;
    let pages = { currentPage: page, totalPages: 0, search };
    let begin = ((page - 1) * itemPerPage);
    console.time('start');
    let files = await db.file.findAndCountAll({
        order: ['NameNormalize'],
        offset: begin,
        limit: 200,
        where: {
            [db.Op.and]: [
                { Id: playList },
                { Name: { [db.Op.like]: '%' + search + '%' } }
            ]
        },
        attribute:['Id', 'Name', 'NameNormalize']
    });
    pages.totalPages = Math.ceil(count / itemPerPage);

    $container.empty().append(renderer('allfiles', { files, pages }));
    loadScript("allfiles.js");
    
    const play = (e) =>{
        let li = e.target.closest('li');
        playAudio(li.id);
        selectListRow($(li));
    }

    loadAllFilesConfig(loadPlayListView, play);
    console.timeEnd('start');
}

const loadView = async (id) => {
    delete listConfig;
    delete foldersConfig;
    delete playingConfig;
    delete loadTasks;
    delete directoriesConfig;
    delete loadAllFilesConfig;

    config.lastIds = [];
    switch (id) {
        case "tab-playing": {
            loadPlayListView(1, "");
            break;
        }
        case "tab-list": {
            let lists = await db.list.findAll({ order: ['Name'] });

            let files = lists[0] ? await lists[0].getFiles() : [];
            $container.empty().append(renderer('playlist', { lists, files }));
            $('#list-a li:first-child').addClass('active');
            $('#list-b li:first-child').addClass('active');
            loadScript("playlist.js");
            listConfig();
            break;
        }
        case "tab-all": {

            await loadAllFiles(1);
            break;
        }
        case "tab-folders": {

            let listA = await db.folder.findAndCountAll({ order: ['Name'] });
            let listB = { count: 0, rows: [] };

            if (listA.rows[0]) {
                listB.rows = await listA.rows[0].getFiles({ order: ['NameNormalize'] });
            }

            $container.empty().append(renderer('folders', { listA, listB }));
            $('#list-a li:first-child').addClass('active');
            $('#list-b li:first-child').addClass('active');
            loadScript("folders.js");
            foldersConfig(listB.rows);
            break;
        }
        case "tab-shedules": {
            $container.empty().append(renderer('tasks', {}));
            loadScript("task.js");
            loadTasks();
            break;
        }
        case "tab-directories": {
            let dirs = await db.directory.findAll({ order: ['Name'] });
            $container.empty().append(renderer('directories', { directories: dirs }));
            loadScript("directories.js");
            loadDirectoryConfig();
            break;
        }
    }
}

$('#nav-menu input[type=radio]').change((e) => {
    let id = e.target.id;
    loadView(id);
});

/********************************* Player ********************************************************* */

let volcontrol = $('.vol-slider')[0];
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
player.volume = config.volume; 
volcontrol.setAttribute('value', config.volume);

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
            playAudio(playList.find(f => f.Id === config.currentFile.Id));
        } else {
            playAudio(playList[0]);
        }
    }
}

btnPlay.onchange = pauseOrPlay;

player.ontimeupdate = (e) => {
    if (update && Slider) {
        Slider.value = Math.floor(player.currentTime);
        $vTotalTime.text(formatTime(player.currentTime) + "/" + vDuration);
        config.currentFile.current = player.currentTime;
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

/********************Play audio file**************************************/

const playAudio = async (Id, prev) => {

    config.currentFile.Id = Id;
    selectListRow($('#' + Id));
    if (Id) {
        db.file.findOne({ where: { Id }, include: { model: db.folder } }).then(file => {
            if (file) {
                player.src = path.join(file.Folder.Path, file.Name);
            }
        });
    }
}
/**************************************************************************/


$('#v-next').click(nextAudio);
$('#v-prev').click(prevAudio);

btnShuffler.onchange = (e) => {
    config.shuffle = btnShuffler.checked;
    loadPlayList(OriginalPlayList);
}

/****************list share code****************************/

selectListRow = ($el) => {
    if ($el[0]) {
        $el.closest('.list-container').find('li').removeClass('active');
        $el.addClass('active');
        $el.focus();
    }
}

$('#container').on('click', '.list-container li', (e) => {
    if (!$(e.target).hasClass('fa, fas, far')) {
        selectListRow($(e.target.closest('li')));
    }
});

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
        db.list.findOne({ where: { Name: 'Playing' } }).then(list => {
            list.getFiles({ order: ['NameNormalize'] }).then(files => {
                loadPlayList(files.map(f => f.Id));
                loadView('tab-playing');
            });
        });
    });

    console.clear();
});
