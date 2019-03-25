
foldersConfig = (loadedFiles) =>{
    let tempFiles = loadedFiles;
     
    $('#list-a li').click((e) => {
        let folderId = e.target.closest('li').id;
        db.folder.findOne({ where: { Id: folderId } }).then(dir => {
            dir.getFiles({ order: ['NameNormalize'] }).then(files => {
                tempFiles = files;
                $('#list-b').empty().append(renderer('file-list', { files }));
                $('#right-panel #total-items').text(files.length);
            });
        });
    });

    $('#list-b').on('dblclick', 'li', (e)=>{
        let li = e.target.closest('li');
        loadPlayList(tempFiles.map(f=> f.Id));
        playAudio(li.id);
    });
}



