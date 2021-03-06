$('#always-on-top').change(e => {
    setAlwaysOnTop(e.target.checked);
});

const db = require('./models');
const os = require('os');
const getId = () => Math.random().toString(36).slice(-6);
//const id3 = require('id3js');

const btnShuffler = document.getElementById('random-audio');

const $container = $('#container');

const getEl = (query) => document.querySelector(query);

var playList;
var OriginalPlayList;
const itemPerPage = 500;

var config = {
    volume: 0.5,
    shuffle: false,
    rewind: false,
    currentFile: { Id: 0, Name: "", current: 0 }
}

const getTabIndex = (tab) => {
    return [...document.querySelectorAll('.tab-content')].indexOf(tab);
}

const getFileList = async(data) => {
    return await db.sqlze.query(
        `Select Id, Name, NameNormalize 
        from Files where Name LIKE ? and Id ${data.not} in(Select FileId 
        from FileLists where ListId = ?) 
        ORDER BY NameNormalize;`, {
            model: db.File,
            mapToModel: true,
            replacements: [data.val, data.Id],
            type: db.sqlze.QueryTypes.SELECT
        });
}

const getIndex = (file) => playList.findIndex(f => f === file.Id);

const loadScript = (script) => {
    var loadedScript = document.createElement("script");
    loadedScript.id = 'pagescript';
    loadedScript.src = "./public/js/" + script;
    $('#pagescript').replaceWith(loadedScript);
}

var myList;

const loadAllFiles = async(page, search, noReload) => {
    let begin = ((page - 1) * itemPerPage);
    let items = await db.file.findAndCountAll({
        order: ['NameNormalize'],
        offset: begin,
        limit: itemPerPage,
        where: {
            Name: {
                [db.Op.like]: "%" + (search || "") + "%"
            }
        },
        attribute: ['Id', 'Name', 'NameNormalize']
    });

    let totalPages = Math.ceil(items.count / itemPerPage);
    if (!noReload) {
        $('#allfiles').empty().append(renderer('allfiles', { files: items, pages: { currentPage: page, totalPages, search } }));
         animateTab($('#allfiles'));
        loadAllFilesConfig();
    } else
        loadPlayList(items.rows.map(f => f.Id));

}

loadPlayListView = async(page, search) => {
    let count = OriginalPlayList.length;
    let pages = { currentPage: page, totalPages: 0, search };
    let begin = ((page - 1) * itemPerPage);
    let files = await db.file.findAndCountAll({
        order: ['NameNormalize'],
        offset: begin,
        limit: 200,
        where: {
            [db.Op.and]: [
                { Id: playList },
                {
                    Name: {
                        [db.Op.like]: '%' + search + '%'
                    }
                }
            ]
        },
        attribute: ['Id', 'Name', 'NameNormalize']
    });

    pages.totalPages = Math.ceil(count / itemPerPage);

    $('#playing').empty().append(renderer('allfiles', { files, pages }));
    if(booting){
        booting = false;
    }else
        animateTab($('#playing'));
    playingConfig();
}

const animateTab = async ($nextTab, direction) =>{
    let width = window.innerWidth;
    let indexFrom = getTabIndex($('.current-tab')[0]);
    let indexTo = getTabIndex($nextTab[0]);


    if(indexFrom > indexTo){
        width *= -1;

    }

    $('.current-tab').animate({ left: width }, {
        duration: 300,
        always: function () {
             $('.current-tab').removeClass('current-tab').empty().css({display: 'none'});
        }
    });

    $nextTab.css({display: 'block'});
    $nextTab.animate({ left: 0 }, {
        duration: 300,
        always: function () {
             $nextTab.addClass('current-tab');
             
            if(indexFrom < indexTo){
                $('.current-tab').prevAll().css({left: width});
            }else{
                $('.current-tab').nextAll().css({left: width});
            }
        }
    });
    
}

let booting = true;

const loadView = async(id) => {

    config.lastIds = [];
    switch (id) {
        case "tab-playing":
            {
                loadPlayListView(1, "");
                break;
            }
        case "tab-list":
            {
                let lists = await db.list.findAll({
                    where: {
                        Name: {
                            [db.Op.not]: '000RCPLST'
                        }
                    }
                });

                let files = lists[0] ? await lists[0].getFiles() : [];
                $('#playlist').empty().append(renderer('playlist', { lists, files }));
                $('#list-a li:first-child').addClass('active');
                $('#list-b li:first-child').addClass('active');
                animateTab($('#playlist'));
                listConfig();
                break;
            }
        case "tab-all":
            {

                await loadAllFiles(1);
                break;
            }
        case "tab-folders":
            {

                let listA = await db.folder.findAndCountAll({ order: ['Name'] });
                let listB = { count: 0, rows: [] };

                if (listA.rows[0]) {
                    listB.rows = await listA.rows[0].getFiles({ order: ['NameNormalize'] });
                }

                $('#folders').empty().append(renderer('folders', { listA, listB }));
                $('#list-a li:first-child').addClass('active');
                $('#list-b li:first-child').addClass('active');
                animateTab($('#folders'));
                foldersConfig(listB.rows);
                break;
            }

        case "tab-shedules":
            {
                $('#task').empty().append(renderer('tasks', {}));
                animateTab($('#task'));
                break;
            }
        case "tab-directories":
            {
                let dirs = await db.directory.findAll({ order: ['Name'] });
                $('#directories').empty().append(renderer('directories', { directories: dirs }));
                animateTab($('#directories'));
                loadDirectoryConfig();
                break;
            }
    }
}

$('#nav-menu input[type=radio]').change((e) => {
    let id = e.target.id;
    loadView(id);
});

$("#a-player").on("wheel", (e) => {

    if (e.originalEvent.deltaY < 0) {
        volcontrol.value = player.volume + 0.05;
        player.volume = volcontrol.value;
    } else {
        volcontrol.value -= 0.05;
        player.volume = volcontrol.value;
    }
});
/************************************************************************************************* */

$('#container').on('dblclick', '.fas, .far, .fa', (e) => {
    e.stopPropagation();
});

const savelist = async(id) => {
    let list = await db.list.findByPk(id);

    var result = await dialog.showSaveDialog(mainWindow, {
        title: 'Save List',
        properties: ['createDirectory', 'showHiddenFiles'],
        defaultPath: path.join(os.homedir(), 'Music', 'regae.json')
    });

    if (!result.canceled) {
        let dir = result.filePath;
        let songs = (await list.getFiles()).map(s => s.Name);
        let tempPlayList = {
            name: list.Name,
            songs: songs
        }
        fs.writeJSONSync(dir, tempPlayList);
    }
}

const openList = async() => {

    var result = await dialog.showOpenDialog(mainWindow, {
        title: 'Open List',
        properties: ['openFile', 'showHiddenFiles', 'multiSelections'],
        defaultPath: path.join(os.homedir(), 'Music'),
        filters: [{
                name: "Play List",
                extensions: ['json']
            },
            {
                name: 'All Files',
                extensions: ['*']
            }
        ]
    });

    if (!result.canceled) {
        for (let f of result.filePaths) {
            let tempPlayList = fs.readJSONSync(f);
            let list = await db.list.findOrCreate({ where: { Name: tempPlayList.name } });
            let files = await db.file.findAll({ where: { Name: tempPlayList.songs } });
            list[0].setFiles(files);
        }
        loadView($('#nav-menu input[type=radio]:checked')[0].id);
    }
}


$(() => {
    let tempConfig = local.getObject('config');
    if (tempConfig) {
        console.log("loading config", tempConfig)
        config = tempConfig;
    }

    player.volume = volcontrol.value = parseFloat(config.volume);
    btnShuffler.checked = config.shuffle;

    db.init().then(() => {
        createBackgroundWin('scan-dirs');
        db.list.findOne({ where: { Name: '000RCPLST' } }).then(list => {
            list.getFiles({ order: ['NameNormalize'] }).then(files => {
                loadPlayList(files.map(f => f.Id));
                loadView('tab-playing');
            });
        });
    });
});