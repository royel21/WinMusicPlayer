const {
    ipcRenderer
} = require('electron');
const app = require('electron').remote;
const dialog = app.dialog;

const mainWindow = app.getCurrentWindow();
var isMaximized = false;

const pageN = document.getElementById("page-n");


closeWindow = () => mainWindow.close();
minWindow = () => mainWindow.minimize();
maxWindow = () => {
    if (isMaximized === true) {
        mainWindow.unmaximize();
        hideCorner(false);
    } else {
        mainWindow.maximize();
        hideCorner(true);
    }
}

hideCorner = (state) => {
    document.body.setAttribute('wmaximize', state);
    isMaximized = state;
}

mainWindow.on('maximize', (event, a) => {
    hideCorner(true);
});

mainWindow.on('unmaximize', (event, a) => {
    hideCorner(false);
});

setfullscreen = () => {
    if (!document.webkitIsFullScreen) {
        document.body.webkitRequestFullscreen();
        mainWindow.setResizable(false);
       
        pageN.style.display = "none"; 
    } else {
        document.webkitCancelFullScreen();
        pageN.style.display = 'inline-block'
        mainWindow.setResizable(true);
    }
}

const setAlwaysOnTop = (state) => mainWindow.setAlwaysOnTop(state);

document.getElementById("btn-sys-min").onclick = minWindow;
document.getElementById("btn-sys-min").onclick = minWindow;
document.getElementById("btn-sys-max").onclick = maxWindow;
document.getElementById("btn-sys-close").onclick = closeWindow;
// document.getElementById("btn-fullscr").onclick = setfullscreen;

