loadAllFilesConfig = () =>{
    let loadFiles = () =>{
        let filter = $('.search-input').val();
        db.file.findAll({
            where: {
            Name: {
                [db.Op.like]: "%" + filter + "%"
            }}, include: {model: db.directory}
            }).then(files=>{
           $('#list-a').empty().append(renderer('file-list', {files}));
        }).catch(err=>{
            console.log(err);
        });
    }
    
    $('#list-a').dblclick((e)=>{
            let id = e.target.closest('li').id;
            playAudio(config.playList.find(f => f.Id === id));
    });
    $('#search-form').submit((e)=>{
        e.preventDefault();
        loadFiles();
    });

    $('#search-form').on('click', '.clear-search', (e) => {
          e.target.closest('span').previousSibling.value = "";
          loadFiles();
    });

    $('#list-A li').dblclick((e)=>{
        let id = e.target.closest('li').id;
        playAudio(config.playList.find(f => f.Id === id));
    });
}
loadAllFilesConfig();