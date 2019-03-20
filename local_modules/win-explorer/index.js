const WinExplore = require("./build/Release/win_explorer");
const path = require('path')


var drive = [
    "Unknown Drive type", "Drive is invalid",
    "Removable Drive", "Hard Disk",
    "Remote (Network) Drive",
    "CD-Rom/DVD-Rom", "Ram Drive"
];
sortFiles = (a, b) => {
    var a1 = a.FileName.replace(/\(/ig, "0").replace(/\[/ig, "1");
    var b1 = b.FileName.replace(/\(/ig, "0").replace(/\[/ig, "1");
    return a1.localeCompare(b1);
};

function ListFiles(dir, filters, oneFile = false) {
    var d = path.resolve(dir);
    var files = WinExplore.ListFiles(d, oneFile).sort(sortFiles);

    if (filters !== undefined && filters.length > 0) {
        return files.filter(v => filters.includes(v.extension.toLowerCase()));
    } else {
        return files;
    }
}

ListFilesR = (dir) => {
    var temp = path.resolve(dir);
    var files = [];
    listAll = (d) => {
        let fs1 = WinExplore.ListFiles(d)
        for (f of fs1) {
            if (f.isDirectory) {
                files.push(f);
                var p = path.join(d, f.FileName);
                listAll(p);
            } else {
                files.push(f);
            }
        }
    }
    listAll(temp);
    return files;
}



ListFilesRO = (dir) => {
    var temp = path.resolve(dir);
    listAll = (d) => {
        let fs1 = WinExplore.ListFiles(d);
        let files = [];
        for (f of fs1) {
            if (f.isDirectory) {
                var f2 = {
                    FileName: path.join(d, f.FileName),
                    Files: listAll(path.join(d, f.FileName)),
                    isDirectory: true,
                    Size: 0
                }
                files.push(f2);
            } else {
                files.push(f);
            }
        }
        return files;
    }
    return listAll(temp);
}

function ListDrivesInfo() {
    return WinExplore.ListDrivesInfo();
}

module.exports = {
    ListFiles,
    ListFilesR,
    ListFilesRO,
    ListDrivesInfo
}