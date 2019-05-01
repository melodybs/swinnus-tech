var express = require('express');
var User = require('../models').User;

var router = express.Router();

/* GET home page. 
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});*/

/*
router.get('/', (req, res, next) => {
  User.findAll()
    .then((users) => {
      //sequelize.pug 페이지를 렌더링, users 데이터를 보냄.
      res.render('sequelize', { users });
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });
});
async/await 변환 => */
router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.render('sequelize', { users });
  } catch(err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
