playingConfig = () => {
    
    $('#search-form').on('click', '.clear-search', (e) => {
        e.target.closest('span').previousSibling.value = '';
        loadPlayListView(1, '');
    });

    $('#search-form').submit((e) => {
        e.preventDefault();
    });

    $('#items-container .search-input').on('input', (e) => {
        let filter = e.target.value;
        
         loadPlayListView(1, filter).then(()=>{
             let search = getEl('input[type=text]');
             search.focus();
             search.setSelectionRange(filter.length, filter.length);
        });
    });

    $('#items-container').on('click', '.page-link', (e) => {
        let filter = $('.search-input').val();
        let page = parseInt(e.target.closest('span').dataset.page);
        loadPlayListView(page, filter);
    });

    selectListRow($('#' + config.currentFile.Id));
}
