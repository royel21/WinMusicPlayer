loadTasks = () =>{
    
     hideModal = (e) => {
        $('#modal').fadeOut('slow', (e) => { });
        $('#modal-container').fadeOut('slow', (e) => {
            $('#modal-container').remove();
        });
    }

    $('.show-form').click((e) => {

        let $modalContainer = $(renderer('modal-task'));
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
        let file;
        $modal.find('#f-name').click(e=>{
            var files = dialog.showOpenDialog(mainWindow, {
                title: "Select the tone",
                properties: ['openFile', 'showHiddenFiles'],
                defaultPath: path.join(os.homedir(), 'Music')
            });
            if(files){ 
                file = files[0];
                $('#f-name').text(path.basename(file));
            }
            console.log(file);

        });
    });
}