$('#play-list').on('click', 'li', (e)=> selectListRow($(e.target.closest('li'))) );

$('#play-list').on('dblclick', 'li', (e)=>{
    let id = e.target.closest('li').id;
    playAudio(id);
    selectListRow($(e.target.closest('li')));
});

selectListRow = ($el) => {
    if($el[0]){
        $('#play-list li').removeClass('active');
        $el.addClass('active');
        $el.focus();
    }
}

$('#play-list').on('keydown', 'li', (e) => {
    console.log(e.keyCode);
    switch (e.keyCode) {
        case 13:
            {
                let id = e.target.closest('li').id;
                playAudio(id);
                selectListRow($(e.target.closest('li')));
                break;
            }

        case 38:
            {
                selectListRow($('#play-list .active').prev());
                event.preventDefault();
                break;
            }

        case 40:
            {
                selectListRow($('#play-list .active').next());
                event.preventDefault();
                break;
            }
    }
});

selectListRow($('#'+currentId));