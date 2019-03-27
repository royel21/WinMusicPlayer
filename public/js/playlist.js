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
        } 
    });

    $('.show-form').click((e) => { 
         showModal('modal-textbox', { modalTitle: "Create Play List", btnAccept: "Create" }, async ($modal) =>{
            let val = $modal.find('#name').val();
            if (val.length > 0) {
                try{
                    let list = await db.list.create({ Name: val });
                    if (list) {
                        console.log(list)
                        $('#list-a').append(renderer('list-row', { list }));

                    }
                }catch(error){
                     $modal.find('#errors').append(`<span>Duplicate Name</span>`);
                     return Promise.reject(error);
                }
                
            }
         });
    });
}