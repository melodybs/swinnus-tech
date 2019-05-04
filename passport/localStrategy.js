const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const { SbirdUser } = require('../models');

module.exports = (passport) => {
  //첫번째 인자 객체는 전략 관한 설정. 일치하는 req.body 속성명을 적어주면 됨.
  passport.use(new LocalStrategy({
    usernameField: 'email', //req.body.email
    passwordField: 'password', //req.body.password
  //두번째 인자는 실제 전략 수행. done함수는 passport.authenticate의 콜백함수
  }, async (email, password, done) => {
    try {
      const exUser = await SbirdUser.findOne({ where: { email } });
      if (exUser) {
        const result = await bcrypt.compare(password, exUser.password);
        if (result) {
          done(null, exUser);
        } else {
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        }
      } else {
        done(null, false, { message: '가입되지 않은 회원입니다.' });
      }
    } catch (err) {
      console.error(err);
      done(err);
    }
  }));
};