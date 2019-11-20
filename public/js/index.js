$('#always-on-top').change(e => {
    setAlwaysOnTop(e.target.checked);
});

const { renderer } = require('./modules/renderer');
const db = require('./models');
const os = require('os');
const getId = () => Math.random().toString(36).slice(-6);
const id3 = require('id3js');

const btnShuffler = document.getElementById('random-audio');

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

const loadScript = (script) => {
    var loadedScript = document.createElement("script");
    loadedScript.id = 'pagescript';
    loadedScript.src = "./public/js/" + script;
    $('#pagescript').replaceWith(loadedScript);
}

var myList;

const loadAllFiles = async (page, search) => {
    let begin = ((page - 1) * itemPerPage);
    let items = await db.file.findAndCountAll({
        order: ['NameNormalize'],
        offset: begin,
        limit: itemPerPage,
        where: { Name: { [db.Op.like]: "%" + (search || "") + "%" } },
        attribute: ['Id', 'Name', 'NameNormalize']
    });

    let totalPages = Math.ceil(items.count / itemPerPage);

    $container.empty().append(renderer('allfiles', { files: items, pages: { currentPage: page, totalPages, search } }));

    loadScript("allfiles.js");

    $('#list-a li:first-child').addClass('active');

    const play = (e) => {
        if($(e.target).hasClass('fa, fas, far')) return;
        
        let id = e.target.closest('li').id;
        let filter = $('.search-input').val();
        db.file.findAll({
            order: ['NameNormalize'],
            where: { Name: { [db.Op.like]: "%" + filter + "%" } },
            attribute: ['Id', 'NameNormalize']
        }).then(files => {
            loadPlayList(files.map(f => f.Id));
        });
    }

    loadAllFilesConfig(loadAllFiles, play);
}

loadPlayListView = async (page, search) => {
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
                { Name: { [db.Op.like]: '%' + search + '%' } }
            ]
        },
        attribute: ['Id', 'Name', 'NameNormalize']
    });

    pages.totalPages = Math.ceil(count / itemPerPage);

    $container.empty().append(renderer('allfiles', { files, pages }));
    loadScript("allfiles.js");

    const play = (e) => {
        let li = e.target.closest('li');
        selectListRow($(li));
    }

    loadAllFilesConfig(loadPlayListView, play);
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
            let lists = await db.list.findAll({ order: ['Name'], where: { Name: { [db.Op.not]: '000RCPLST' } } });

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


/************************************************************************************************* */
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
