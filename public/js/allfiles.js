loadAllFilesConfig = (loadedfiles) => {
    let tempFiles = loadedfiles.map(f=> { return { Id: f.Id, Name: f.Name, Path: f.Folder.Path} });
    let loadFiles = () => {
        let filter = $('.search-input').val();

        let files = tempFiles.filter(f=> f.Name.toLowerCase().includes(filter.toLowerCase()));

        $('#all-files').empty().append(renderer('file-list', 
            { files , edit: true }
        ));

        $('#total-items').text(files.length);
        return files;
    }

    $('#search-form').submit((e) => {
        e.preventDefault();
        loadFiles();
    });

    $('#search-form').on('click', '.clear-search', (e) => {
        e.target.closest('span').previousSibling.value = "";
        loadFiles();
    });

    $('#all-files').on('dblclick', 'li', (e) => {
        let id = e.target.closest('li').id;
        config.playList = loadFiles();
        playAudio(config.playList.find(f => f.Id === id));
    });
}
