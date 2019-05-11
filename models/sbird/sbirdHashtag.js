module.exports = (sequelize, DataTypes) => (
  sequelize.define('sbirdHashtag', {
    title: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'sbird_hashtags',
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  })
);
