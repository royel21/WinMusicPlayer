const Sequelize = require("sequelize");
const path = require('path');
const os = require('os');
const fs = require('fs-extra');
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
// db.serie = require('./serie')(sequelize, DataTypes);
// db.favorite = require('./favorites')(sequelize, DataTypes);
db.directory = require('./directories')(sequelize, DataTypes);
// db.favoriteVideo = require('./favorite-video')(sequelize, DataTypes);
db.filelist = require('./filelist')(sequelize, DataTypes);

db.sqlze = sequelize;

db.list.belongsToMany(db.file, { through: { model: db.filelist } });
db.file.belongsToMany(db.list, { through: { model: db.filelist } });

// db.favorite.belongsToMany(db.video, { through: db.favoriteVideo, foreignKey: "FavoriteId" });
// db.video.belongsToMany(db.favorite, { through: db.favoriteVideo, foreignKey: "VideoId" });

db.directory.hasMany(db.file, { onDelete: 'cascade' });
db.file.belongsTo(db.directory);

// db.video.belongsTo(db.serie);

// db.user.hasOne(db.favorite);
// db.serie.hasMany(db.video);

db.init = async () => {
    await sequelize.sync();
}

module.exports = db;