const getFolderOrPlayListId = () => $('#list-a .active').attr('id');
const isView = (id) => $('input[name="tabs"]:checked').attr('id').includes(id);

const loadPlayList = (files) => {
        OriginalPlayList = files;
        playList = [...OriginalPlayList];
        if (btnShuffler.checked) {
            playList.shuffle();
        }
    }
    // hide modal
const hideModal = () => {
    $('#modal').fadeOut('slow');
    $('#modal-container').fadeOut('slow', (e) => {
        $('#modal-container').remove();
    });
}

$('body').on('click', '.close-modal', hideModal);
//show modal
const showModal = (modal, data, callback) => {
    let $modal = $(renderer(modal, data));
    $modal.hide();
    $('body').prepend($modal);
    $modal.fadeIn('fast', () => {
        $modal.find('#modal').fadeIn('fast');
    });
    $modal.on('click keydown', '#accept, #name', (e) => {
        let accept;
        if (e.target.id === 'name' && e.keyCode === 13 || e.target.id == 'accept') {
            accept = true;
        }

        if (accept) {
            callback($modal.find('#modal')).then(() => {
                hideModal();
            }).catch(err => {

            });
        }
    });
    $modal.find('#f-name').click(e => {
        var files = dialog.showOpenDialog(mainWindow, {
            title: "Select the tone",
            properties: ['openFile', 'showHiddenFiles'],
            defaultPath: path.join(os.homedir(), 'Music')
        });
        if (files) {
            $('#f-name').data('path', files[0]);
            $('#f-name').text(path.basename(files[0]));
        }
    });
}

//Delete file from DB and disk
const deleteFile = (e) => {
    let li = e.target.closest('li');
    if (isView('folder') || isView('all')) {
        showModal('delete-modal', { file: $(li).find('#item-name').text() }, async() => {
            try {
                if (li) {
                    let file = await db.file.findOne({ where: { Id: li.id }, include: { model: db.folder } });
                    if (file) {
                        fs.removeSync(path.join(file.Folder.Path, file.Name));
                        await file.destroy();
                        $(li).fadeOut('fast', () => {
                            li.remove();
                        });
                    }
                }
            } catch (err) {
                console.log(err)
                return Promise.reject(error);
            }
        });
    } else if (isView('playing')) {
        db.list.findOne({ where: { Name: '000RCPLST' } }).then(list => {
            list.removeFiles([li.id]).then(files => {
                console.log(files);
            });
        });
    }
    e.stopPropagation();
}


//Rename File from disk
$('body').on('click', '.files-list .fa-edit', (e) => {
    let li = e.target.closest('li');
    let $oldName = $(li).find('#item-name');
    showModal('modal-textbox', { modalTitle: "Rename File", btnAccept: "Rename", name: $oldName.text() }, async($modal) => {
        let $name = $modal.find('#name');
        try {
            if (li) {
                let file = await db.file.findOne({ where: { Id: li.id }, include: { model: db.folder } });
                if (file) {
                    await file.update({ Name: $name.val(), NameNormalize: nameFormat($name.val()) });
                    let oldPath = path.join(file.Folder.Path, $oldName.text());
                    let newPath = path.join(file.Folder.Path, $name.val());
                    fs.moveSync(oldPath, newPath);
                    $oldName.text($name.val());
                }
            }
        } catch (err) {
            console.log(err)
            return Promise.reject(error);
        }
    });
});

/****************list share code****************************/

selectListRow = ($el) => {
    if ($el[0]) {
        $el.closest('.list-container').find('li').removeClass('active');
        $el.addClass('active');
        $el.focus();
    }
}

$('#container').on('click', '.list-container li', (e) => {
    if (!$(e.target).hasClass('fa, fas, far')) {
        selectListRow($(e.target.closest('li')));
    }
});

$('#container').on('keydown', 'ul li', (e) => {
    let $item = $(e.target.closest('ul')).find('.active');
    console.log(e.keyCode);
    switch (e.keyCode) {
        case 38:
            {
                selectListRow($item.prev());
                e.stopPropagation();
                event.preventDefault();
                break;
            }

        case 40:
            {
                selectListRow($item.next());
                e.stopPropagation();
                event.preventDefault();
                break;
            }
        case 13:
            {
                if ($(e.target).hasClass('file')) {

                    playAudio(e.target.closest('li').id);

                } else if ($(e.target).hasClass('folder')) {
                    loadFolderontent(e.target.closest('li').id);
                } else {

                }
                e.stopPropagation();
                break;
            }
        case 123:
            {
                mainWindow.toggleDevTools();
                break;
            }
    }
});

$('#container').on('dblclick', '.fa, .fas, far', (e) => {
    e.stopPropagation();
});

$('#container').on('dblclick', '.file', (e) => {
    playAudio(e.target.closest('li').id);
});

document.body.onkeydown = (e) => {
    if (e.keyCode == 123) {
        mainWindow.toggleDevTools();
    }
}