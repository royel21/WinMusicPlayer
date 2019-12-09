const fs = require('fs-extra');
const WinDrive = require('win-explorer');
const path = require('path');
let fileFilter = ['mp3', 'ogg', 'm4a', 'aac', 'wma'];
let tempFiles = [];
const removeDuplicate = async(folder, fis) => {
    var fis = fis.filter((f) => {
        return f.isDirectory || fileFilter.includes(f.extension.toLocaleLowerCase()) && !f.isHidden
    });

    for (var f of fis) {
        if (f.isDirectory) {

            if (f.Files.length === 0) {
                fs.removeSync(path.join(f.FileName));
                console.log("Empty", f.FileName)
            } else
            if (f.Files.length === 1 && fileFilter.includes(f.Files[0].FileName.split('.').pop())) {
                let fi = f.Files[0]
                fs.moveSync(path.join(f.FileName, fi.FileName), path.join(folder, fi.FileName));
                console.log(path.join(f.FileName, fi.FileName), path.join(folder, fi.FileName))
            }

            await removeDuplicate(f.FileName, f.Files);
        } else {
            let found = tempFiles.find(a => a === f.FileName);
            if (found) {
                console.log("Dup: " + f.FileName);
                fs.removeSync(path.join(folder, f.FileName));
            } else {
                tempFiles.push(f.FileName);
            }
            if (['jpg', ''].includes(f.Files[0].FileName.split('.').pop()))
        }
    }
}

let files = WinDrive.ListFilesRO("E:\\Music");

removeDuplicate("E:\\Music", files).then(() => {

});