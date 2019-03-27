
const savePlayList = async () => {
    await player.pause();
    let list = await db.list.findOne({ where: { Name: "Playing" } });
    let files = await list.getFiles();
    await list.removeFiles(files);
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