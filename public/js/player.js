const nextAudio = (e) => {
    let index = getIndex(config.currentFile);
    if (++index < playList.length) {
        playAudio(playList[index]);
    } else {
        playAudio(playList[0]);
    }
}

const prevAudio = (e) => {
    let index = getIndex(config.currentFile);
    if (--index > -1 && index < playList.length) {
        playAudio(playList[index]);
    } else {
        playAudio(playList[playList.length - 1]);
    }
}

// ********************************* Player *********************************************************

let volcontrol = $('.vol-slider')[0];
let btnPlay = document.getElementById('v-play');
let btnMuted = document.getElementById('v-mute');
let player = document.getElementById('player');
let $vTotalTime = $('#v-total-time');
let update = false;
let vDuration;

Slider = new SliderRange('#slider-container');
Slider.min = 0;
Slider.value = 0;
Slider.max = 0;
Slider.setPreviewContent($('<span id="v-current-time">'));
player.volume = config.volume;
volcontrol.setAttribute('value', config.volume);

Slider.onPreview = (value) => {
    $('#v-current-time').text(formatTime(Math.floor(value)));
}

player.onloadedmetadata = function (e) {
    Slider.min = 0;
    Slider.max = player.duration;
    Slider.value = 0;
    vDuration = formatTime(player.duration);
    $('#v-total-time').text(formatTime(0) + '/' + vDuration);
    update = true;
}

Slider.oninput = (value) => {
    player.currentTime = value;
}

volcontrol.oninput = (e) => {
    player.volume = config.volume = volcontrol.value;
}

const pauseOrPlay = () => {
    var playPause = 'Pausar';
    if (player.paused) {
        player.play().catch(e => { });
    } else {
        player.pause();
        playPause = 'Reproducir';
    }

    $('#video-viewer .fa-play-circle').attr('data-title', playPause);

    btnPlay.checked = player.paused;
    if (player.src === '') {
        if (config.currentFile.Id !== 0) {
            playAudio(playList.find(f => f.Id === config.currentFile.Id));
        } else {
            playAudio(playList[0]);
        }
    }
}

btnPlay.onchange = pauseOrPlay;

player.ontimeupdate = (e) => {
    if (update && Slider) {
        Slider.value = Math.floor(player.currentTime);
        $vTotalTime.text(formatTime(player.currentTime) + '/' + vDuration);
        config.currentFile.current = player.currentTime;
    }
}

player.onvolumechange = function (e) {
    if (update) {
        volcontrol.value = config.volume = player.volume;
        volcontrol.setAttribute('value', player.volume);
    }
}

btnMuted.onchange = () => {
    player.muted = btnMuted.checked;
    $('.fa-volume-up').attr('data-title', btnMuted.checked ? 'No Silenciar' : 'Silenciar');
}

player.onended = nextAudio;

// *******************Play audio file*************************************

const playAudio = async (Id, prev) => {
    config.currentFile.Id = Id;
    selectListRow($('#' + Id));
    if (Id) {
        db.file.findOne({ where: { Id }, include: { model: db.folder } }).then(file => {
            if (file) {
                player.src = path.join(file.Folder.Path, file.Name);
            }
        });
    }
}
/**************************************************************************/

$('#v-next').click(nextAudio);
$('#v-prev').click(prevAudio);

btnShuffler.onchange = (e) => {
    config.shuffle = btnShuffler.checked;
    // loadPlayList(OriginalPlayList);
}