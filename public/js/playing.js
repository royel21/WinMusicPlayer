playingConfig = () => {
    
    $('#search-form').on('click', '.clear-search', (e) => {
        e.target.closest('span').previousSibling.value = '';
        loadPlayListView(1, '');
    });

    $('#search-form').submit((e) => {
        e.preventDefault();
    });

    $('.tab-content .search-input').on('input', (e) => {
        let filter = e.target.value;
        
         loadPlayListView(1, filter).then(()=>{
             let search = getEl('input[type=text]');
             search.focus();
             search.setSelectionRange(filter.length, filter.length);
        });
    });

    $('.tab-content').on('click', '.page-link', (e) => {
        let filter = $('.search-input').val();
        let page = parseInt(e.target.closest('span').dataset.page);
        loadPlayListView(page, filter);
    });

    
    $('.list-container ul').on('click', '.fa-trash-alt', (e) => {
        e.stopPropagation();
        let li = e.target.closest('li');

        if (li.id) {
            db.list.findOne({where: {Name: '000RCPLST'}}).then(list=>{
                 if(list){
                    db.filelist.destroy({ where: { ListId: list.Id, FileId: li.id } }).then(result=>{
                         $(li).fadeOut('fast', () => {
                            li.remove();
                         });
                        console.log(result);
                     })
                 }
            });
        }
    });

    selectListRow($('#' + config.currentFile.Id));
}
