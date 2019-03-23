listConfig = () => {

    let loadFiles = () => {
        let id = $('#sub-content input[type=radio]:checked').attr('id');
        let listId = getSelectedId();
        let val = $('#list-b').closest('.col-6').find('.search-input').val();
        let condition = { val: `%${val}%`, Id: listId || "", not: '' };

        if (!id.includes('content')) {
            condition.not = 'not';
        }

        getFileList(condition).then(files => {
            $('#list-b').empty().append(renderer('file-list', { add: !id.includes('content'), files }));
            $('#total-files').text($('#content-b li').length);
        });
    }

    $('#sub-content input[type=radio]').change((e) => loadFiles());

    $('#content-b').on('submit', (e) => {
        e.preventDefault();
        loadFiles();
    });

    $('#content-b').on('dblclick', '#list-b li', (e) => {
        let id = e.target.closest('li').id;
        console.log(id);
        db.list.findOne({
            where: { Id: getSelectedId() },
            include: {
                model: db.file,
                include: { model: db.folder }
            }

        }).then(list => {
            loadPlayList(list.Files).then(() => {
                playAudio(config.playList.find(f => f.Id === id));
            });
        });
    });

    $('#search-form').on('click', '.clear-search', (e) => {
        e.target.closest('span').previousSibling.value = "";
        loadFiles();
    });

    $('#list-b').on('click', '.add-to-list', (e) => {
        if (getSelectedId().length > 0) {
            let li = e.target.closest('li');
            db.filelist.create({
                FileId: li.id,
                ListId: getSelectedId()
            }).then(() => {
                $(li).fadeOut('fast', () => {
                    li.remove();
                });
            });
        } else {

        }
    });

    hideModal = (e) => {
        $('#modal').fadeOut('slow', (e) => { });
        $('#modal-container').fadeOut('slow', (e) => {
            $('#modal-container').remove();
        });
    }

    $('.show-form').click((e) => {

        let $modalContainer = $(renderer('modal'));
        $('body').prepend($modalContainer);
        let $modal = $modalContainer.find('#modal');

        $modal.fadeIn('fast');

        $modal.find('.close-modal').click(hideModal);
        $modal.find('#create-list').click((e) => {
            let val = $modal.find('#name').val();
            if (val.length > 0) {
                db.list.create({ Name: val }).then(list => {
                    if (list) {
                        console.log(list)
                        $('#list-a').append(renderer('list-row', { list }));
                        hideModal();
                    } else {

                    }
                }).catch(err => {
                    console.log(err)
                });
            }
        });
    });
    loadFiles();
}
listConfig();