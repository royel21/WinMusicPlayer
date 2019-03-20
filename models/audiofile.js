module.exports = (sequelize, DataTypes) => {

    const Video = sequelize.define('AudioFile', {
        Id: {
            type: DataTypes.STRING(10),
            primaryKey: true,
            unique: true,
            allowNull: false
        },
        Name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        NameNormalize:
        {
            type: DataTypes.STRING(100)
        },
        Duration: {
            type: DataTypes.FLOAT(5, 2),
            defaultValue: 0,
            allowNull: false
        }
    }, {
            timestamps: false,
            hooks: {
                beforeValidate: function (item, options) {
                    item.Id = Math.random().toString(36).slice(-6);
                },
                beforeBulkCreate: (instances, options) => {
                    for (var item of instances) {
                        item.Id = Math.random().toString(36).slice(-6)
                    }
                }
            }
        });

    Video.findByName = (name) => {
        return Video.findOne({
            where: {
                Name: name
            },
            include: {model: 'Directory'}
        });
    }

    return Video;
}