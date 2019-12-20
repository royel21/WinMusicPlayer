const loadAllFilesConfig = (play) => {
    $('#files-list #all-files').on('dblclick', 'li', play);

    $('#files-list #all-files').on('click', '.fa-trash-alt', deleteFile);

    $('#files-list #search-form').on('click', '.clear-search', (e) => {
        e.target.closest('span').previousSibling.value = '';
        loadView(1, '');
    });

    $('#files-list #search-form').submit((e) => {
        e.preventDefault();
        let filter = $('.search-input').val();
        loadView(1, filter);
    });

    $('#files-list #items-container').on('click', '.page-link', (e) => {
        let filter = $('.search-input').val();
        let page = parseInt(e.target.closest('span').dataset.page);
        loadView(page, filter);
    });

    $('#files-list #select-page').change(e => {
        let filter = $('.search-input').val();
        loadView(parseInt(e.target.value), filter);
    });

    const selectLast = () => {
        let id = config.currentFile.Id;

        if (!$('#' + id)[0]) id = $('li').attr('id');
        selectListRow($('#' + id));
    }

    selectLast();
}
