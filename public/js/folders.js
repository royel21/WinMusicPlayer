

$('#list-a li').click((e) => {
    let folderId = e.target.closest('li').id;
    db.folder.findOne({ where: { Id: folderId } }).then(dir => {
        dir.getFiles({ order: ['NameNormalize'] }).then(files => {
            console.log()
            $('#list-b').empty().append(renderer('file-list', { files }));
            $('#right-panel .title span').text(files.length + ' - Content');
        });
    });
});


