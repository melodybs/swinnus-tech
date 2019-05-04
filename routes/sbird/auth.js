const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { SbirdUser } = require('../../models');

const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;

  try {
    const exUser = await SbirdUser.findOne( {where: { email }} );
    if (exUser) {
      req.flash('joinError', '이미 가입된 이메일 입니다');
      return res.redirect('/sbird/join');
    }

    //crypto모듈의 pbkdf2로 암호화 해도 됨. 두번째 인자는 pbkdf2의 반복회수와 비슷.
    //숫자가 커지면 시간이 오래 걸리지만 강력함. 12이상 추천. 31까지 가능.
    const hash = await bcrypt.hash(password, 12);
    await SbirdUser.create({
      email,
      nick,
      password: hash,
    });

    return res.redirect('/sbird');
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
  //미들웨어를 라우터 미들웨어 안에 넣을 수 있음. 미들웨어에 사용자 정의 기능 추가 하고 싶을때 이렇게 가능.
  passport.authenticate('local', (authErr, user, info) => {
    //성공 OR 실패하면 콜백 함수 호출되고, authErr이 있다면 실패한것
    if (authErr) {
      console.error(authErr);
      return next(authErr);
    }

    //두번째 인자가 있다면 성공한것.
    if(!user) {
      req.flash('loginError', info.message);
      return res.redirect('/sbird');
    }

    //성공했다면 req.login(passport.serializeUser)를 호출
    return req.login(user, (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }
      return res.redirect('/sbird');
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

router.get('/logout', isLoggedIn, (req, res) => {
  //req.user 객체를 제거
  req.logout();
  //req.session 객체를 제거 (user.id)
  req.session.destroy();
  res.redirect('/sbird');
});

router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/sbird',
}), (req, res) => {
  res.redirect('/sbird');
});

module.exports = router;