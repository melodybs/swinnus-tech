module.exports = (sequelize, DataTypes) => (
  sequelize.define('sauctionUser', {
    email: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    nick: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    money: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'sauction_users',
    timestamps: true,
    paranoid: true,
    charset: 'utf8',
    collate: 'utf8_general_ci',
  })
);