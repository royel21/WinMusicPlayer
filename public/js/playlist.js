var lastEvent;
const listConfig = () => {
    const getFilesListId = () => $('#sub-content input[type=radio]:checked').attr('id');
    const createList = (e) => showModal('modal-textbox', { modalTitle: 'Create Play List', btnAccept: 'Create' }, async ($modal) => {
        let val = $modal.find('#name').val();
        if (val.length > 0) {
            try {
                let list = await db.list.create({ Name: val });
                if (list) {
                    $('#list-a li').removeClass('active');
                    let $row = $(renderer('list-row', { list }));
                    $row.focus();
                    $('#list-a').append($row);
                }
            } catch (error) {
                console.log(error)
                $modal.find('#errors').append('<span>Duplicate Name</span>');
                return Promise.reject(error);
            }
        }
    });

    let loadFiles = listId => {
        let id = getFilesListId();
        let val = $('#list-b').closest('panel').find('.search-input').val();
        let condition = { val: `%${val}%`, Id: listId || '', not: '' };

        if (!id.includes('content')) {
            condition.not = 'not';
        }

        getFileList(condition).then(files => {
            $('#list-b').empty().append(renderer('file-list', { add: !id.includes('content'), files }));
            $('#list-b #total-items').text(files.length);
        });
    }

    $('#sub-content input[type=radio]').change((e) => loadFiles($('#list-a .active')[0].id));

    $('#list-b').on('submit', (e) => {
        e.preventDefault();
        loadFiles($('#list-a .active')[0].id);
    });

    $('#list-b').on('dblclick', 'li', (e) => {

        let id = e.target.closest('li').id;

        if (getFilesListId().includes('content')) {
            db.list.findOne({
                where: { Id: getFolderOrPlayListId() }
            }).then(list => {
                list.getFiles().then(files => {
                    loadPlayList(files.map(f => f.Id));
                });
            });
        } else {
            loadPlayList([id]);
        }
    });

    $('#list-a').on('click', '.fa-trash-alt', (e) => {
        e.stopPropagation();
        let li = e.target.closest('li');
        if (li.id) {
            console.log(li.id);
            db.list.destroy({ where: { Id: li.id } }).then((result) => {
                $(li).fadeOut('fast', () => {
                    li.remove();
                    loadFiles($('#list-a .active')[0].id);
                });
                console.log(result)
            });
        }
    });

    $('#list-a').on('click', 'li', (e) => {
        loadFiles(e.target.id);
    });

     $('#list-b').on('click', '.fa-trash-alt', (e) => {
        lastEvent = e;
        e.stopPropagation();
        let li = e.target.closest('li');
        let listId = $('#list-a .active')[0].id;
        if (li.id) {
            console.log(li.id);
            db.filelist.destroy({ where: { ListId: listId, FileId: li.id } }).then((result) => {
                $(li).fadeOut('fast', () => {
                    li.remove();
                    loadFiles($('#list-a .active')[0].id);
                });
                console.log(result)
            });
        }
    })

    $('#content-b #search-form').on('click', '.clear-search', (e) => {
        e.target.closest('span').previousSibling.value = '';
        loadFiles($('#list-a .active')[0].id);
    });
    
    $('#content-b #search-form').on('submit', (e) => {
        e.preventDefault();
        loadFiles($('#list-a .active')[0].id);
    });

    $('#list-b').on('click', '.add-to-list', (e) => {
        e.stopPropagation();
        if (getFilesListId()) {
            let li = e.target.closest('li');
            let listId  = $('#list-a .active')[0];
            console.log(li.id, listId.id);
            db.filelist.findOrCreate({where: {
                FileId: li.id,
                ListId: listId.id
            }}).then((file) => {
                $(li).fadeOut('fast', () => {
                    li.remove();
                });
            });
        } else {
            createList(e);
        }
    });

    $('.show-form').click(createList);
}
