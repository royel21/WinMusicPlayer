playingConfig = () =>{
    let loadFiles = () =>{
        let filter = $('.search-input').val().toLowerCase();

         $('#play-list').empty().append(renderer('file-list', {

              files: config.playList.filter(a=> a.Name.toLowerCase().includes(filter)) 
         }));
    }

    $('#play-list').on('dblclick', 'li', (e) => {
        let id = e.target.closest('li').id;
        playAudio(config.playList.find(f => f.Id === id));
        selectListRow($(e.target.closest('li')));
    });

    $('#play-list').on('keydown', 'li', (e) => {
        event.preventDefault();
        switch (e.keyCode) {
            case 13:
                {
                    let id = e.target.closest('li').id;
                    playAudio(config.playList.find(f => f.Id === id));
                    selectListRow($(e.target.closest('li')));
                    e.stopPropagation();
                    break;
                }
        }
    });

    selectLast = () => {
        let id = config.currentFile.Id;
        if (!$('#' + id)[0]) id = $('li').attr('id');
        selectListRow($('#' + id));
    }

    $('#search-form').on('click', '.clear-search', (e) => {
        e.target.closest('span').previousSibling.value = "";
        loadFiles();
    });

   $('#search-form').submit((e)=>{ 
         e.preventDefault();
         loadFiles();
    });

    selectLast();
}

playingConfig();