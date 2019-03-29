loadDirectoryConfig = () => {

    $('.show-form').click((e) => {
        var dir = dialog.showOpenDialog(mainWindow, {
            title: "Select the folder",
            properties: ['openDirectory', 'createDirectory', 'showHiddenFiles'],
            defaultPath: path.join(os.homedir(), 'Music')
        });

        if (dir) {
            db.directory.findOrCreate({
                where: {
                    Name: path.basename(dir[0]),
                    Path: dir[0]
                }
            }).then(newDir => {

                if (newDir[1]) {
                    createBackgroundWin('scan-or-rescan', { id: newDir[0].Id });
                    $('#list-dirs ul').append($(renderer('dir-row', { item: newDir[0] })));
                } else {

                }
            }).catch(err => {
                console.log(err);
            })
        }
    });

    $('#list-dirs').on('click', 'li .remove', (e) => {
        let li = e.target.closest('li');
        db.directory.destroy({ where: { Id: li.id } }).then(() => {
            $(li).fadeOut('fast', () => {
                li.remove();
            });
        });
    });

    $('#list-dirs').on('click', 'li .fa-sync', (e) => {
        let li = e.target.closest('li');
        li.querySelector('.fa-sync').classList.add('fa-spin');
        if (li) {
            createBackgroundWin('scan-or-rescan', { id: li.id, reScan: true });
        }
    });
}