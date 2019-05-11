module.exports = (sequelize, DataTypes) => (
  sequelize.define('sauctionAuction', {
    bid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    msg: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  }, {
    tableName: 'sauction_auction',
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  })
);
