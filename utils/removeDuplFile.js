PopulateDB = async (folder, files) => {
    var fis = files.filter((f) => {
        return f.isDirectory || fileFilter.includes(f.extension.toLocaleLowerCase()) && !f.isHidden
    });


    for (var f of fis) {
        try {
            if (!f.isDirectory) {
                total++;
                let found = tempFiles.find(v => v.Name === f.FileName);
                file = await db.audiofile.findOne({
                    where: {
                        Name: f.FileName
                    }
                });

                if (found) {
                    tempFiles.push(f.FileName);
                }
            } else {
                await PopulateDB(f.FileName);
            }
        } catch (error) {

        }
    }
}