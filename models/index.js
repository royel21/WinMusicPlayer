const Sequelize = require("sequelize");
const path = require('path');
const os = require('os');
const dbPath = path.join('./music.db');


const db = {};

const Op = Sequelize.Op
const DataTypes = Sequelize.DataTypes
const sequelize = new Sequelize('sqlite:./' + dbPath, {
    // logging: console.log
    logging: false
});

db.Op = Op;
db.file = require('./file')(sequelize, DataTypes);
db.list = require('./list')(sequelize, DataTypes);

db.folder = require('./Folder')(sequelize, DataTypes);
db.directory = require('./directory')(sequelize, DataTypes);

db.filelist = require('./filelist')(sequelize, DataTypes);
db.task = require('./task')(sequelize, DataTypes);

db.sqlze = sequelize;

db.list.belongsToMany(db.file, { through: { model: db.filelist } });
db.file.belongsToMany(db.list, { through: { model: db.filelist } });

db.folder.hasMany(db.file, { onDelete: 'cascade' });
db.file.belongsTo(db.folder);


db.directory.hasMany(db.folder, { onDelete: 'cascade' });
db.folder.belongsTo(db.directory);

db.init = async () => {
    await sequelize.sync();
    await db.directory.findOrCreate({
        where: {
            Name: 'Music', 
            Path: path.join(os.homedir(), 'Music')
        }
    });
    await db.list.findOrCreate({
        where: {
            Name: '000RCPLST'
        }
    });
}

module.exports = db;