//sequelize-cli가 자동 생성 해주는 코드 그대로 사용시 에러 많음. Default 주석으로 추가
//'use strict';

//Default const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
//Default const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

//Default let sequelize;
//Default if (config.use_env_variable) {
//Default   sequelize = new Sequelize(process.env[config.use_env_variable], config);
//Default } else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
//Default }

/*Default 
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
*/

db.sequelize = sequelize;
db.Sequelize = Sequelize;

/* START1 기본 설정 아닌 커스텀 추가. DB 테이블 설정 및 관계 설정.*/
//테이블 설정.
db.User = require('./user')(sequelize, Sequelize);
db.Comment = require('./comment')(sequelize, Sequelize);
//관계설정(MySQL의 JOIN기능을 시퀄이 자동 구현)
/*
1:N(일대다)=> 1->N: 1.hasMany(N, {foreignKey: '', sourceKey: ''}); // 1에 대한 N 로우들을 불러온다.
              N->1: N.belongsTo(1, {foreignKey: '', targetKey: ''}); // N에 대한 1로우를 불러온다.
1:1(일대일)=> 1<->1: 1.hasOne(1, {foreignKey: '', sourceKey: ''}); // 1에 대한 1의 로우를 불러온다.
              1<->1: 1.belongsTo(1, {foreignKey: '', targetKey: ''});// 1에 대한 1의 로우를 불러온다.
N:M(다대다)=> N<->M: N.belongsToMany(M, {through: ''}); //N에 대한 M의 로우를 불러온다
              M<->N: M.belongsToMany(N, {through: ''}); //N에 대한 M의 로우를 불러온다
*/
db.User.hasMany(db.Comment, { foreignKey: 'commenter', sourceKey: 'id' });
db.Comment.belongsTo(db.User, { foreignKey: 'commenter', targetKey: 'id' });
/*기본 쿼리 
INSERT => DB.create({K:V, ...});
SELECT * => DB.findAll({}); // SELECT * ... LIMIT 1; => .find({});
Ex) SELECT id, name FROM users WHERE (name='jm') AND (married=1 OR age>30) 
    ORDER BY age DESC LIMIT1 OFFSET1
  => const { User, Sequlize: {Op} } = require('./user');
     User.findAll({
      attributes: ['id', 'name'],
      where {
        name: 'jm',
        [Op.or]: [{ married: 1 }, { age: { [Op.gt]: 30 } }],
      },
      order: [['age', 'DESC']],
      limit: 1,
      offset: 1,
     });
Op.gt(초과), Op.gte(이상), Op.lt(미만), Op.lte(이하), Op.ne(같지않음), Op.or(또는), Op.in(배열요소중하나), Op.notIn(배열요소와모두다름) 등...
UPDATE => DB.update({ colum: '수정내용' }, { where: { ... } });
DELETE => DB.destroy({ where: { ... } });
*/
/* END1 */

module.exports = db;
