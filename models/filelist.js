module.exports = (sequelize, DataTypes) => {

    const FileList = sequelize.define('FileList', {
        Id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
            timestamps: false,
            uniqueKeys: {
                FileList_unique: {
                    fields: ['ListId', 'FileId']
                }
            }
        });

    return FileList;
}