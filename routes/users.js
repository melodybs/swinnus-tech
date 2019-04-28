var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
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
