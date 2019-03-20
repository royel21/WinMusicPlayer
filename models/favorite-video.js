// module.exports = (sequelize, DataTypes) => {

//     const FavoriteVideo = sequelize.define('FavoriteVideo', {
//         Id:{
//             type: DataTypes.INTEGER,
//             primaryKey: true,
//             autoIncrement: true
//         },
//         VideoId: {
//             type: DataTypes.STRING(10),
//             allowNull: false
//         },
//         FavoriteId: {
//             type: DataTypes.INTEGER,
//             allowNull: false
//         }
//     }, {
//             timestamps: false
//         });

//     return FavoriteVideo;
// }