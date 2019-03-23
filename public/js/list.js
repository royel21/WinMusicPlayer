$('#sub-content input[type=radio]').change((e) => {
    let id = e.target.id;
    let folderId = $('#list-a .active')[0] ? $('#list-a .active')[0].id : "";
    condition = { order: ['NameNormalize'] }

    if (id.includes('folder-content')) {
        db.folder.findOne({ where: { Id: folderId } }).then(dir => {
            dir.getFiles({ order: ['NameNormalize'] }).then(files => {
                console.log()
                $('#list-b').empty().append(renderer('file-list', { files }));
                $('#total-videos').text(files.length);
            });
        });
    } else {
        db.file.findAll({
            order: ['NameNormalize'],
            where: {
                [db.Op.not]: [{ DirectoryId: folderId }]
            },
            include: { model: db.folder }
        }).then(files => {
            console.log()
            $('#list-b').empty().append(renderer('file-list', { files }));
            $('#total-videos').text(files.length);
        });
    }
});
