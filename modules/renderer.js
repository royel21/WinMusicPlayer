
    const pug = require('pug');
    const path = require('path');

    exports.renderer = (file, data) =>{
        file = file.split('.')[0]+'.pug';
        console.time("pug")
        let renderTree = pug.compileFile(path.join(process.env.INIT_CWD, 'template', file));
        let html = renderTree(data);
        console.timeEnd("pug")
        return html;
    }