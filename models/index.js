const Sequelize = require("sequelize");
const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const dbPath = path.join('./music.db');


const db = {};

const Op = Sequelize.Op
const DataTypes = Sequelize.DataTypes
const sequelize = new Sequelize('sqlite:./' + dbPath, {
    // logging: console.log,
    logging: false
});

db.Op = Op;
db.audiofile = require('./audiofile')(sequelize, DataTypes);
// db.category = require('./category')(sequelize, DataTypes);
// db.serie = require('./serie')(sequelize, DataTypes);
// db.favorite = require('./favorites')(sequelize, DataTypes);
db.directory = require('./directories')(sequelize, DataTypes);
// db.favoriteVideo = require('./favorite-video')(sequelize, DataTypes);
// db.videoCategory = require('./VideoCategory')(sequelize, DataTypes);

db.sqlze = sequelize;

// db.category.belongsToMany(db.video, { through: { model: db.videoCategory } });
// db.video.belongsToMany(db.category, { through: { model: db.videoCategory } });

// db.favorite.belongsToMany(db.video, { through: db.favoriteVideo, foreignKey: "FavoriteId" });
// db.video.belongsToMany(db.favorite, { through: db.favoriteVideo, foreignKey: "VideoId" });

db.directory.hasMany(db.audiofile, { onDelete: 'cascade' });
db.audiofile.belongsTo(db.directory);
// db.video.belongsTo(db.serie);

// db.user.hasOne(db.favorite);
// db.serie.hasMany(db.video);

db.init = async () => {
    await sequelize.sync();
}

module.exports = db;