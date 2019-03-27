
const path = require('path');

module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
        Id: {
            type: DataTypes.STRING(20),
            unique: true,
            primaryKey: true,
            allowNull: false
        },
        Name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        Days: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        Tone: {
            type: DataTypes.STRING,
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
            },
            instanceMethods: {
                Name: function() {
                    return path.basename(this.Tone);                
                }
              }
        });

    return Task;
}