loadAllFilesConfig = (loadView, play) => {
    $('#all-files').on('dblclick', 'li', play);

    $('#all-files').on('click', '.fa-trash-alt', deleteFile);

    $('#search-form').on('click', '.clear-search', (e) => {
        e.target.closest('span').previousSibling.value = '';
        loadView(1, '');
    });

    $('#search-form').submit((e) => {
        e.preventDefault();
        let filter = $('.search-input').val();
        loadView(1, filter);
    });

    $('#items-container').on('click', '.page-link', (e) => {
        let filter = $('.search-input').val();
        let page = parseInt(e.target.closest('span').dataset.page);
        loadView(page, filter);
    });

    $('#select-page').change(e => {
        let filter = $('.search-input').val();
        loadView(parseInt(e.target.value), filter);
    });

    selectLast = () => {
        let id = config.currentFile.Id;

        if (!$('#' + id)[0]) id = $('li').attr('id');
        selectListRow($('#' + id));
    }

    selectLast();
}
