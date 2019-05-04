module.exports = (sequelize, DataTypes) => (
  sequelize.define('sbirdPost', {
    content: {
      type: DataTypes.STRING(140),
      allowNull: false,
    },
    img: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
  }, {
    tableName: 'sbird_posts',
    timestamps: true,
    paranoid: true,
  })
);
