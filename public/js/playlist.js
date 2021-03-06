var lastEvent;
const listConfig = () => {
    const getTabId = () => $('#sub-content input[type=radio]:checked').attr('id');

    const getListId = () => getEl('#list-a .active') ? getEl('#list-a .active').id : "";

    const createList = (e) => showModal('modal-textbox', { modalTitle: 'Create Play List', btnAccept: 'Create' }, async (
        $modal) => {
        let val = $modal.find('#name').val();
        if (val.length > 0) {
            try {
                let list = await db.list.create({ Name: val });
                if (list) {
                    $('#list-a li').removeClass('active');
                    let $row = $(renderer('list-row', { list }));
                    $row.focus();
                    $('#list-a ul').append($row);
                }
            } catch (error) {
                console.log(error)
                $modal.find('#errors').append('<span>Duplicate Name</span>');
                return Promise.reject(error);
            }
        }
    });

    let loadFiles = listId => {
        let tabId = getTabId();
        let val = getEl('#content-b .search-input').value;
        let condition = { val: `%${val}%`, Id: listId || '', not: '' };

        if (!tabId.includes('content')) {
            condition.not = 'not';
        }

        getFileList(condition).then(files => {
            $('#list-b').empty().append(renderer('file-list', { add: !tabId.includes('content'), files }));
            getEl('#content-b #total-items').textContent = files.length;
        });
    }
    $('#list-a li').click((e) => {
        let Id = e.target.closest('li').id;
        loadFiles(Id);
    });
    $('#sub-content input[type=radio]').change((e) => loadFiles(getListId()));

    $('#content-b').on('submit', (e) => {
        e.preventDefault();
        loadFiles(getListId());
    });

    $('#content-b').on('dblclick', 'li', (e) => {

        let id = e.target.closest('li').id;

        if (getTabId().includes('content')) {
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

    $('#content-a').on('click', '.fa-trash-alt', (e) => {
        e.stopPropagation();
        let li = e.target.closest('li');
        if (li.id) {
            console.log(li.id);
            db.list.destroy({ where: { Id: li.id } }).then((result) => {
                $(li).fadeOut('fast', () => {
                    li.remove();
                    loadFiles(getListId());
                });
                console.log(result)
            });
        }
    });

    $('#content-b').on('click', '.fa-trash-alt', (e) => {
        lastEvent = e;
        e.stopPropagation();
        let li = e.target.closest('li');
        let listId = getListId();
        if (li.id) {
            console.log(li.id);
            db.filelist.destroy({ where: { ListId: listId, FileId: li.id } }).then((result) => {
                $(li).fadeOut('fast', () => {
                    li.remove();
                    loadFiles(getListId());
                });
                console.log(result)
            });
        }
    });

    $('#content-b #search-form').on('click', '.clear-search', (e) => {
        e.target.closest('span').previousSibling.value = '';
        loadFiles(getListId());
    });

    $('#content-b .search-input').on('input', (e) => {
        e.preventDefault();
        loadFiles(getListId());
    });

    $('#content-b').on('click', '.add-to-list', (e) => {
        e.stopPropagation();
        if (getTabId()) {
            let li = e.target.closest('li');
            let listId = $('#list-a .active')[0];
            console.log(li.id, listId.id);
            db.filelist.findOrCreate({
                where: {
                    FileId: li.id,
                    ListId: listId.id
                }
            }).then((file) => {
                $(li).fadeOut('fast', () => {
                    li.remove();
                });
            });
        } else {
            createList(e);
        }
    });

    $('.controls .show-form').click(createList);

    $('#list-a .show-form').click((e) => {
        let li = e.target.closest('li');
        db.list.findByPk(li.id).then(list => {
            if (list) {
                showModal('modal-textbox', {
                    modalTitle: 'Edit List',
                    btnAccept: 'Save',
                    name: li.textContent.trim()
                }, async ($modal) => {
                    let val = $modal.find('#name').val();
                    if (val.length > 0) {
                        
                        list.update({Name: val});
                        li.querySelector('#item-name').textContent = val;
                    }
                });
            }
        });
    });

    $('#list-a .fa-save').click((e) => {

        savelist(e.target.closest('li').id);
    });

    $('#open-list').click(openList);
}