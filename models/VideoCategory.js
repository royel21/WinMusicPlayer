// module.exports = (sequelize, DataTypes) => {

//     const VideoCategory = sequelize.define('VideoCategory', {
//         Id:{
//             type: DataTypes.INTEGER,
//             primaryKey: true,
//             autoIncrement: true
//         }
//     }, {
//             timestamps: false,
//             uniqueKeys: {
//                 VideoCategory_unique: {
//                     fields: ['CategoryId', 'VideoId']
//                 }
//             },
//             // classMethods: {
//             //     associate: function(models) {
        
//             //         Branch_Employee.belongsTo(models.model('Video'), {
//             //             as: 'video',
//             //             foreignKey: 'VideoId'
//             //         });
        
//             //         Branch_Employee.belongsTo(models.model('Category'), {
//             //             as: 'category',
//             //             foreignKey: 'CategoryId'
//             //         });
//             //     }
//             // }
//         });

//     return VideoCategory;
// }