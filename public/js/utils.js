const fs = require('fs-extra');
const path = require('path');
const local = localStorage;
const { renderer } = require('./modules/renderer');

const BrowserWindow = app.BrowserWindow;
const invisPath = `file://${path.join(__dirname, 'background/createthumb.html')}`;
const windowID = mainWindow.id;

createBackgroundWin = (event, data) => {
    var e = event;
    var d = data;
    var win = new BrowserWindow({
        width: 1,
        height: 1,
        show: false,
        webPreferences: { nodeIntegration: true },
        // width: 1000,
        // height: 1000,
        // show: true
    });
    win.loadURL(invisPath);
    win.webContents.on('did-finish-load', () => {
        try {
            win.webContents.send(e, d, windowID);
        } catch (error) {}
    });
    win.on('closed', (e) => {
        win = null;
    });
}

template = (file, data) => {
    var template = fs.readFileSync(path.join(__dirname, file), {
        encoding: 'utf-8'
    });
    for (var key in data) {
        var regex = new RegExp(eval("/({" + key + "})/ig"));
        template = template.replace(regex, data[key]);
    }
    return template;
}

$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function(elem) {
        return $(elem).text().trim().toUpperCase().includes(arg.trim().toUpperCase());
    };
});

$.expr[":"].textequalto = $.expr.createPseudo(function(arg) {
    return function(elem) {
        return $(elem).text().trim().toUpperCase() === arg.trim().toUpperCase();
    };
});

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    if (value == "undefined") return {};
    return value && JSON.parse(value);
}

Storage.prototype.hasObject = (key) => {
    return local.getObject(key) != null && !$.isEmptyObject(local.getObject(key));
}

Number.prototype.map = function(in_min, in_max, out_min, out_max) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

Array.prototype.removeById = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] instanceof Object && this[i].Id == obj.Id) {
            return this.splice(i, 1)[0];
        }
    }
}

Array.prototype.removeBy = function(obj, by) {
    var i = this.length;
    while (i--) {
        if (this[i] instanceof Object && this[i][by] == obj[by]) {
            return this.splice(i, 1)[0];
        }
    }
}

// Array.prototype.randomFile = function () {
//     return this[Math.floor(Math.random() * this.length)]
// }

Array.prototype.shuffle = function() {
    var counter = this.length,
        temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = (Math.random() * counter--) | 0;

        // And swap the last element with it
        temp = this[counter];
        this[counter] = this[index];
        this[index] = temp;
    }
};

Object.defineProperty(Array.prototype, "last", {
    get: function() {
        return this[this.length - 1];
    }
});

function nameFormat(name, padding = 3) {
    var res1 = name.split(/\d+/g);
    var res2 = name.match(/\d+/g);
    var temp = name;
    if (res1 == null && res2 == null) {
        for (let [i, s] of res2.entries()) {
            temp += res1[i] + String(Number(s)).padStart(padding, 0);
        }
        temp = temp + res1[res1.length - 1];
    }

    var elem = document.createElement('textarea');
    elem.innerHTML = temp.replace(/[\\|?|<|>|*|:|"]/ig, '').replace("  ", " ");
    return elem.value;
}


formatTime = (time) => {
    var h = Math.floor(time / 3600);
    var min = Math.floor((time / 3600 - h) * 60);
    var sec = Math.floor(time % 60);
    return (h == 0 ? "" : String(h).padStart(2, "0") + ':') +
        String(min).padStart(2, "0") + ':' + String(sec).padStart(2, "0");
}