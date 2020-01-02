const loadAllFilesConfig = (play) => {
    $('#items-container').on('dblclick', '.file', (e)=> {    
         let filter = getEl('.search-input').value;    
         loadAllFiles(1, filter, true);
    });

    $('#items-container #all-files').on('click', '.fa-trash-alt', deleteFile);

    $('#items-container #search-form').on('click', '.clear-search', (e) => {
        e.target.closest('span').previousSibling.value = '';
        loadAllFiles(1, "").then(()=>{
             getEl('.search-input').focus();
        });
    });

    $('#items-container .search-input').on('input', (e) => {
        let filter = e.target.value;
        console.log(filter)
        loadAllFiles(1, filter).then(()=>{
             let search = getEl('input[type=text]');
             search.focus();
             search.setSelectionRange(filter.length, filter.length);
        });
    });

    $('#items-container').on('click', '.page-link', (e) => {
        let filter = getEl('.search-input').value;
        let page = parseInt(e.target.closest('span').dataset.page);
        loadAllFiles(page, filter);
    });

    $('#items-container #select-page').change(e => {
        let filter = getEl('.search-input').value;
        loadAllFiles(parseInt(e.target.value), filter);
    });

    const selectLast = () => {
        let id = config.currentFile.Id;

        if (!$('#' + id)[0]) id = $('li').attr('id');
        selectListRow($('#' + id));
    }

    selectLast();
}