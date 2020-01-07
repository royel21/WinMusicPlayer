const loadAllFilesConfig = (play) => {
    $('.tab-content').on('dblclick', '.file', (e)=> {    
         let filter = getEl('.search-input').value;    
         loadAllFiles(1, filter, true);
    });

    $('.tab-content #all-files').on('click', '.fa-trash-alt', deleteFile);

    $('.tab-content #search-form').on('click', '.clear-search', (e) => {
        e.target.closest('span').previousSibling.value = '';
        loadAllFiles(1, "").then(()=>{
             getEl('.search-input').focus();
        });
    });

    $('.tab-content .search-input').on('input', (e) => {
        let filter = e.target.value;
        
        loadAllFiles(1, filter).then(()=>{
             let search = getEl('input[type=text]');
             search.focus();
             search.setSelectionRange(filter.length, filter.length);
        });
    });

    $('.tab-content').on('click', '.page-link', (e) => {
        let filter = getEl('.search-input').value;
        let page = parseInt(e.target.closest('span').dataset.page);
        loadAllFiles(page, filter);
    });

    $('.tab-content #select-page').change(e => {
        let filter = getEl('.search-input').value;
        loadAllFiles(parseInt(e.target.value), filter);
    });
    

    $('#search-form').submit((e) => {
        e.preventDefault();
    });

    selectListRow($('#' + config.currentFile.Id));
}