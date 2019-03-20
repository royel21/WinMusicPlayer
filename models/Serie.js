// module.exports = (sequelize, DataTypes) => {

//     const Serie = sequelize.define('Serie', {
//         Id: {
//             type: DataTypes.STRING(10),
//             primaryKey: true,
//             unique: true,
//             allowNull: false
//         },
//         Name: {
//             type: DataTypes.STRING(100),
//             unique: true
//         },
//         CoverPath: {
//             type: DataTypes.STRING,
//             allowNull: true
//         }
//     }, {
//             timestamps: false,
//             hooks: {
//                 beforeValidate: function (item, options){
//                     item.Id = Math.random().toString(36).slice(-5);
//                 },
//                 beforeBulkCreate: (instances, options) => {
//                     for (var item of instances) {
//                         item.Id = Math.random().toString(36).slice(-5)
//                     }
//                 }
//             }
//         });
//     return Serie;
// }


