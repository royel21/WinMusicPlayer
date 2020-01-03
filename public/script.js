var leftPane;
var rightPane;
var divider;

var leftLimit;
var rightLimit;
var dragging = false;

function onDrag(pageX, startX) {
    let width = $('#items-container').width() - divider.offsetWidth
    if (pageX < leftLimit) {
        pageX = leftLimit + 2;
    }

    if (pageX > width - rightLimit) {
        pageX = width - rightLimit - 8;
    }

    var left = ((pageX) / width * 100);


    var right = (100 - left - 0.9);

    leftPane.style.width = left + '%';
    rightPane.style.width = right + '%';

};

function sdrag() {

    var startX = 0;
    divider = document.getElementById('divider');
    leftPane = document.getElementById('content-a');
    rightPane = document.getElementById('content-b');

    leftLimit = parseInt($(leftPane).css('min-width'));
    rightLimit = parseInt($(rightPane).css('min-width'));

    function move(e) {

        onDrag && onDrag(e.pageX, startX);

    }

    function startDragging(e) {
        if (e.currentTarget instanceof HTMLElement || e.currentTarget instanceof SVGElement) {
            dragging = true;
            var left = divider.style.left ? parseInt(divider.style.left) : 0;
            startX = e.pageX - left;
            document.body.addEventListener('mousemove', move);
        } else {
            throw new Error("Your target must be an html element");
        }
    }

    divider.addEventListener('mousedown', startDragging);

    document.body.onmouseup = function(e) {
        if (true === dragging) {
            dragging = false;
            document.body.removeEventListener('mousemove', move);
        }
    }
    let lastSize;
    document.onresize = (e) => {
        if (lastSize < window.innerWidth) {
            onDrag(divider.offsetLeft);
        }
        lastSize = window.innerWidth;
    }
}