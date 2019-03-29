
foldersConfig = (loadedFiles) => {
    let tempFiles = loadedFiles;

    loadFolderontent = async (Id) => {
        let filter = $('#right-panel .search-input').val();

        let files = await db.file.findAll({
            order: ['NameNormalize'],
            where: { [db.Op.and]: [{ FolderId: Id || "" }, { Name: { [db.Op.like]: "%" + (filter || "") + "%" } }] },
            attribute: ['Id', 'Name', 'NameNormalize']
        });

        tempFiles = files;
        $('#list-b').empty().append(renderer('file-list', { files, edit: true }));
        $('#right-panel #total-items').text(files.length);
    }

    $('#right-panel').on('submit', '#search-form', (e) => {
        e.preventDefault();
        let Id = $('#list-a .active').attr('id');
        loadFolderontent(Id);
    });

    $('#right-panel').on('click', '.clear-search', (e) => {
        $('#right-panel .search-input').val("");
        let Id = $('#list-a .active').attr('id');
        loadFolderontent(Id);
    });

    $('#list-a li').click((e) => {
        let Id = e.target.closest('li').id;
        loadFolderontent(Id);
    });

    $('#list-b').on('dblclick', 'li', (e) => {
        let li = e.target.closest('li');
        loadPlayList(tempFiles.map(f => f.Id));
    });
}



