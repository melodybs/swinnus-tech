//sequelize는 비밀번호가 하드코딩 되어 있음. JSON 파일이라 변수 사용 불가. 
//하지만 JSON 파일 대신에 JS파일을 설정 파일로 쓸 수 있게 지원함.
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.SEQUELIZE_USERNAME_DEV,
    password: process.env.SEQUELIZE_PASSWORD_DEV,
    database: process.env.SEQUELIZE_DATABASE_DEV,
    host: process.env.SEQUELIZE_HOST_DEV,
    dialect: 'mysql',
    operatorsAliases: 'false',
  },
  production: {
    username: process.env.SEQUELIZE_USERNAME_PROD,
    password: process.env.SEQUELIZE_PASSWORD_PROD,
    database: process.env.SEQUELIZE_DATABASE_PROD,
    host: process.env.SEQUELIZE_HOST_PROD,
    dialect: 'mysql',
    operatorsAliases: 'false',
    //SQL문이 콘솔에 노출되는것 막음.
    logging: false,
  },  
}