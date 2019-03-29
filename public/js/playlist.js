listConfig = () => {
    const getFilesListId = () => $('#sub-content input[type=radio]:checked').attr('id');
    const createList = (e) => showModal('modal-textbox', { modalTitle: "Create Play List", btnAccept: "Create" }, async ($modal) => {
        let val = $modal.find('#name').val();
        if (val.length > 0) {
            try {
                let list = await db.list.create({ Name: val });
                if (list) {
                    $('#content-a li').removeClass('active');
                    let $row = $(renderer('list-row', { list }));
                    $row.focus();
                    $('#list-a').append($row);

                }
            } catch (error) {
                console.log(error)
                $modal.find('#errors').append(`<span>Duplicate Name</span>`);
                return Promise.reject(error);
            }

        }
    });

    let loadFiles = () => {
        let id = getFilesListId();
        let listId = getgetFolderOrPlayListId();
        let val = $('#list-b').closest('.col-6').find('.search-input').val();
        let condition = { val: `%${val}%`, Id: listId || "", not: '' };

        if (!id.includes('content')) {
            condition.not = 'not';
        }

        getFileList(condition).then(files => {
            $('#list-b').empty().append(renderer('file-list', { add: !id.includes('content'), files }));
            $('#content-b #total-items').text(files.length);
        });
    }

    $('#sub-content input[type=radio]').change((e) => loadFiles());

    $('#content-b').on('submit', (e) => {
        e.preventDefault();
        loadFiles();
    });

    $('#content-b').on('dblclick', '#list-b li', (e) => {
        console.log(e.target);
        if ($(e.target).hasClass('fas')) return;

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

    $('#content-a').on('click', '.fa-trash-alt', (e) => {
        let li = e.target.closest('li');
        if (li.id) {
            console.log(li.id);
            db.list.destroy({ where: { Id: li.id } }).then((result) => {
                $(li).fadeOut('fast', () => {
                    li.remove();
                    loadFiles();
                });
                console.log(result)
            });
        }
    })

    $('#content-b #search-form').on('click', '.clear-search', (e) => {
        e.target.closest('span').previousSibling.value = "";
        loadFiles();
    });

    $('#list-b').on('click', '.add-to-list', (e) => {
        if (getgetFolderOrPlayListId()) {
            let li = e.target.closest('li');
            db.filelist.create({
                FileId: li.id,
                ListId: getgetFolderOrPlayListId()
            }).then(() => {
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