playingConfig = () =>{
    
    
    $('#all-files').on('dblclick', 'li', play);

    $('#all-files').on('keydown', 'li', (e) => {
        event.preventDefault();
        switch (e.keyCode) {
            case 13:
                {
                    play(e); 
                    e.stopPropagation();
                    break;
                }
        }
    });
    

    $('#search-form').on('click', '.clear-search', (e) => {
        e.target.closest('span').previousSibling.value = "";
        loadPlayListView(1, "");
    });

   $('#search-form').submit((e)=>{ 
         e.preventDefault();
         let filter = $('.search-input').val();
         loadPlayListView(1, filter);
    });

    $('#items-container').on('click', '.page-link', (e)=>{ 
        let filter = $('.search-input').val();
        let page = parseInt(e.target.closest('span').dataset.page);
        loadPlayListView(page, filter);
    });

    selectLast = () => {
        let id = config.currentFile.Id;

        if (!$('#' + id)[0]) id = $('li').attr('id');
        selectListRow($('#' + id));
    }
    
    selectLast();
}
