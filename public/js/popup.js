var $popup = $('#popup');
popupHide = (e) => {
    $popup.css({
        display: 'none'
    }).text('');
    $popup.removeClass('popup-top');
}

popupShow = async (event) => {
    var element = $(event.target).closest('.popup-msg')[0];

    if (element !== undefined) {
        var rect = element.getBoundingClientRect();
        var msg = element.dataset.title;
        $popup.css({
            display: 'block',
            top: -3000
        }).text(msg === undefined ? element.textContent : msg);

        var top = rect.top + 8 + rect.height;
        if (top + $popup.height() + 10 > window.innerHeight) {
            top = rect.top - 22 - $popup.height()
            $popup.addClass('popup-top');
        }

        $popup.css({
            top,
            left: (rect.x + rect.width / 2) - ($popup.width() / 2) - 9
        });
    }
}

$('body, .footer').on('mouseenter', '.popup-msg', popupShow);
$('body, .footer').on('mouseleave wheel', '.popup-msg', popupHide);
