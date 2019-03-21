
module.exports = (sequelize, DataTypes) => {
  const Directory = sequelize.define('Directory', {
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
    Path: {
      type: DataTypes.STRING,
      unique: true,
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

  return Directory;
}