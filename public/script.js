var leftPane;
var rightPane;
var divider;

var dragging = false;

function onDrag(pageX, $container) {
    let leftLimit = parseInt($('#content-a').css('min-width'));
    let rightLimit = parseInt($('#content-b').css('min-width'));
    let width = $container.width() - $('#divider').width();
    if (pageX < leftLimit) {
        pageX = leftLimit + 2;
    }

    if (pageX > width - rightLimit) {
        pageX = width - rightLimit - 8;
    }

    var left = ((pageX) / width * 100);


    var right = (100 - left - 0.54);

    $('#content-a').css({width: left + '%' });
    $('#content-b').css({width: right + '%' });

};
 
function move(e) {
    let $container = $(e.target.closest('.tab-content'))
    onDrag && onDrag(e.pageX, $container);
}

function startDragging(e) {
    if (e.currentTarget instanceof HTMLElement || e.currentTarget instanceof SVGElement) {
        dragging = true;
        var left = parseInt($('#divider').css('left')) || 0;
        startX = e.pageX - left;
        document.body.addEventListener('mousemove', move);
    } else {
        throw new Error("Your target must be an html element");
    }
}

document.body.onmouseup = function(e) {
    if (true === dragging) {
        dragging = false;
        document.body.removeEventListener('mousemove', move);
    }
}

let lastSize;
document.onresize = (e) => {
    if (lastSize < window.innerWidth) {
        onDrag($('#divider').offset().left);
    }
    lastSize = window.innerWidth;
}

$('body').on('mousedown', '#divider', startDragging);