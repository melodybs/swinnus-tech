const mongoose = require('mongoose');

const { 
  MONGO_ID_DEV, MONGO_PASSWORD_DEV, MONGO_DATABASE_DEV, MONGO_HOST_DEV,
  MONGO_ID_PROD, MONGO_PASSWORD_PROD, MONGO_DATABASE_PROD, MONGO_HOST_PROD,
  NODE_ENV 
} = process.env;
let MONGO_URL;
let db;
if (process.env.NODE_ENV === 'production') {
  MONGO_URL=`mongodb://${MONGO_ID_PROD}:${MONGO_PASSWORD_PROD}@${MONGO_HOST_DEV}` 
  db = MONGO_DATABASE_PROD;
} else {
  MONGO_URL=`mongodb://${MONGO_ID_DEV}:${MONGO_PASSWORD_DEV}@${MONGO_HOST_PROD}`;
  db = MONGO_DATABASE_DEV;
}

module.exports = () => {
  const connect = () => {
    if (NODE_ENV !== 'production') {
      mongoose.set('debug', true);
    }
    mongoose.connect(MONGO_URL, {
      dbName: db,
    }, (error) => {
      if (error) {
        console.log('몽고디비 연결 에러', error);
      } else {
        console.log('몽고디비 연결 성공');
      }
    });
  };
  connect();

  mongoose.connection.on('error', (error) => {
    console.error('몽고디비 연결 에러', error);
  });
  mongoose.connection.on('disconnected', () => {
    console.error('몽고디비 연결이 끊겼습니다. 연결을 재시도합니다.');
    connect();
  });

  require('./user');
  require('./comment');
//SCHAT
  require('./schat/chat');
  require('./schat/room');
//SMAP
  require('./smap/favorite');
  require('./smap/history');
};