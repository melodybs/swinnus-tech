var express = require('express');
var User = require('../models').User;
const mgUser = require('../schemas/user');
const Comment = require('../schemas/comment');

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

router.get('/mongoose', async (req, res, next) => {
  try {
    const users = await mgUser.find({});
    res.render('mongoose', { users })
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/mongoUsers', async (req, res, next) => {
  try {
    const users = await mgUser.find({});
    res.json(users);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post('/mongoUsers', async (req, res, next) => {
  try {
    const user = new mgUser({
      name: req.body.name,
      age: req.body.age,
      married: req.body.married,
    });
    const result = await user.save(); 
    console.log(result);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/mongoComments/:id', async (req, res, next) => {
  try {
    const comments = await Comment.find({
      commenter: req.params.id
    /*populate 메서드로 관련있는 다큐먼트를 불러올 수 있음. Comment스키마 commenter필드의
    ref가 User로 되어 있으므로 자동으로 User컬렉션에서 사용자 다큐먼트를 찾아 합침.
    commenter필드는 ObjectId가 아니라 그 ObjectId를 가진 사용자 다큐먼트가 됨*/
    }).populate('commenter');
    res.json(comments);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post('/mongoComments', async (req, res, next) => {
  try {
    const comment = new Comment({
      commenter: req.body.id,
      comment: req.body.comment,
    });

    let result = await comment.save();
    //populate메서드로 User스키마와 함침. path 옵션으로 어떤 필드를 합칠지 설정.
    result = await Comment.populate(result, { path: 'commenter' });
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.patch('/mongoComments/:id', async (req, res, next) =>{
  try {
    const result = await Comment.update({
      _id: req.params.id
    }, {
      comment: req.body.comment
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.delete('/mongoComments/:id', async (req, res, next) => {
  try {
    const result = await Comment.deleteOne({
      _id: req.params.id
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
