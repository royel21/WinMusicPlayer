const { renderer } = require('./modules/renderer');
const db = require('./models');
const os = require('os');
const getId = () => Math.random().toString(36).slice(-6);
const id3 = require('id3js');

ipcRenderer.on('error', (event, msg) => {
    console.log(msg)
});

const loadScript = (script) =>{
    var loadedScript = document.createElement("script");
    loadedScript.id = 'pagescript';
    loadedScript.src = script;
    $('#pagescript').replaceWith(loadedScript);
}
const loadView = (id) =>{
    let $container = $('#container');
    let script = "./public/js/";
    switch (id) {
        case "tab-playing": {

            db.audiofile.findAll({ order: ['NameNormalize'] }).then(files => {
                $container.empty().append(renderer('player', {files}));
                loadScript(script+"player.js");
            });
            break;
        }
        case "tab-list": {
            $container.empty();
             loadScript(script+"list.js");
            break;
        }
        case "tab-all": {
            $container.empty();
             loadScript(script += "allfile.js");
            break;
        }
        case "tab-folders": {
            $container.empty().append(renderer('items_home', { title1: "List A", list1: { count: 0 }, title2: "listB", list2: { count: 0 } }));
             loadScript(script+"folders.js");
            break;
        }
        case "tab-shedules": {
            $container.empty();
            script += "shedules.js";
            break;
        }
        case "tab-directories": {
            $container.empty().append(renderer('directories'));
             loadScript(script+"directories.js");
            break;
        }
    }
}
$('.nav-tabs input[type=radio]').change((e) => {
    let id = e.target.id;
    console.log(id);
    loadView(id);
});

loadView('tab-playing');

$(() => {
    let directories = [{ id: getId(), path: path.join(os.homedir(), 'Music') }];
    if (!local.getObject('directories')) {
        local.setObject('directories', directories);
    }
    db.init().then(() => {
        createBackgroundWin('scan-dirs');
    });
});