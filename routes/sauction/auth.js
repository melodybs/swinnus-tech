const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { SauctionUser } = require('../../models');

const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password, money } = req.body;
  try {
    const exUser = await SauctionUser.findOne({ where: { email } });
    if (exUser) {
      req.flash('joinError', '이미 가입된 이메일 입니다.');
      return res.redirect('/sauction/join');
    }

    const hash = await bcrypt.hash(password, 12);
    await SauctionUser.create({
      email,
      nick,
      password: hash,
      money,
    });

    return res.redirect('/sauction');
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('sauction-local', (authErr, user, info) => {
    if (authErr) {
      console.error(authErr);
      return next(authErr);
    }

    if (!user) {
      req.flash('loginError', info.message);
      return res.redirect('/sauction');
    }

    return req.login(user, (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }
      return res.redirect('/sauction');
    });
  })(req, res, next);
});

router.get('/logout', isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect('/sauction');
});

module.exports = router;