listConfig = () => {
    const getFilesListId = () => $('#sub-content input[type=radio]:checked').attr('id');
    
    let loadFiles = () => {
        let id = getFilesListId();
        let listId = getSelectedId();
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
        let id = e.target.closest('li').id;
        if(getFilesListId().includes('content')){
            console.log(id);
            db.list.findOne({
                where: { Id: getSelectedId() }
            }).then(list => {
                list.getFiles().then(files=>{
                    loadPlayList(files.map(f=> f.Id));
                    playAudio(id);
                });
            });
        }else{
            loadPlayList([id]);
            playAudio(id);

        }
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
        $modalContainer.hide();
        $('body').prepend($modalContainer);
        let $modal = $modalContainer.find('#modal');
        $modalContainer.fadeIn('fast',()=>{
            
            $modal.fadeIn('fast');
        });

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
}