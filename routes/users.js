var express = require('express');
var User = require('../models').User;

var router = express.Router();

/* GET users listing. 
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});*/

router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    console.error(err);
    next(err);
  } 
});

router.post('/', async (req, res, next) => {
  try {
    const result = await User.create({
      name: req.body.name,
      age: req.body.age,
      married: req.body.married,
    });

    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

/*19.04.28 connect-flash 모듈 테스트
router.get('/flash', (req, res) => {
  req.session.message = '세션 메시지';
  req.flash('message', 'flash 메시지');
  res.redirect('/users/flash/result');
});

router.get('/flash/result', (req, res) => {
  res.send(`${req.session.message} ${req.flash('message')}`);
});*/

module.exports = router;
