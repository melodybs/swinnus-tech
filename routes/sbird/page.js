const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { SbirdPost, SbirdUser } = require('../../models');

const router = express.Router();

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('sbird/profile', { title: '내 정보 - SwinnusBird', user: req.user });
});

router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('sbird/join', {
    title: '회원가입 - SwinnusBird',
    user: req.user,
    joinError: req.flash('joinError'),
  });
});

router.get('/', (req, res, next) => {
  SbirdPost.findAll({
    include: {
      model: SbirdUser,
      //조회 할때 게시글 작성자의 아이디와 닉네임을 JOIN해서 제공
      attributes: ['id', 'nick'],
    },
    order: [['createdAt', 'DESC']],
  })
    .then((posts) => { console.log(posts[0]);
      res.render('sbird/main', {
        title: 'SwinnusBird',
        twits: posts,
        user: req.user,
        loginError: req.flash('loginError'),
      });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
  /*res.render('./sbird/main', {
    title: 'SwinnusBird',
    twits: [],
    user: req.user,
    loginError: req.flash('loginError'),
  });*/
});

module.exports = router;