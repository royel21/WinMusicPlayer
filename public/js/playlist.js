$('#sub-content input[type=radio]').change((e) => {
    let id = e.target.id;
    let folderId = $('#list-a .active')[0].id
    console.log(id, folderId)
//     db.directory.findOne({ where: { Id: folderId } }).then(dir => {
//         dir.getFiles({ order: ['NameNormalize'] }).then(files => {
//             console.log()
//             $('#list-b').empty().append(renderer('file-list', { files }));
//             $('#right-panel .title span').text(files.length + ' - Content');
//         });
//     });
});
