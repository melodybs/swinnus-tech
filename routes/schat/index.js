const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const SchatRoom = require('../../schemas/schat/room');
const SchatChat = require('../../schemas/schat/chat');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const rooms = await SchatRoom.find({});
    res.render('schat/main', { 
      rooms, 
      title: 'SwinnusChat 채팅방', 
      error: req.flash('roomError') 
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/room', (req, res) => {
  res.render('schat/room', { title: 'SwinnusChat 채팅방 생성'});
});

router.post('/room', async (req, res, next) => {
  try {
    const room = new SchatRoom({
      title: req.body.title,
      max: req.body.max,
      owner: req.session.color,
      password: req.body.password,
    });
    const newRoom = await room.save();
    
    //app.set('io', io)로 저장했던 io객체를 가져옴.
    const io = req.app.get('io');
    ///schat/room 네임스페이스에 연결한 모든 클라에 데이터를 보냄.
    //네임스페이스가 따로 없는 경우에는 io.emit()메서드로 모두에게 보낼 수 있음.
    io.of('/schat/room').emit('newRoom', newRoom);
    
    res.redirect(`/schat/room/${newRoom._id}?password=${req.body.password}`);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.get('/room/:id', async (req, res, next) => {
  try {
    const room = await SchatRoom.findOne({ _id: req.params.id });
    const io = req.app.get('io');

    if (!room) {
      req.flash('roomError', '존재하지 않는 방입니다');
      return res.redirect('/schat');
    }

    if (room.password && room.password !== req.query.password) {
      req.flash('roomError', '비밀번호가 틀렸습니다.');
      return res.redirect('/schat');
    }

    //io.of('/schat/chat').adapter에 방 목록이 들어 있음.
    //io.of('/schat/chat').adapter.rooms[req.params.id]에 해당 방의 소켓 목록이 있음.
    const { rooms } = io.of('/schat/chat').adapter;
    if (rooms && rooms[req.params.id] && room.max <= rooms[req.params.id].length) {
      req.flash('roomError', '허용 인원을 초과하였습니다.');
      return res.redirect('/schat');
    }

    //기존 채팅 내역을 불러온다.
    const chats = await SchatChat.find({ room: room._id }).sort('createdAt');
    return res.render('schat/chat', {
      room,
      title: room.title,
      chats,
      user: req.session.color,
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.delete('/room/:id', async (req, res, next) => {
  try {
    await SchatRoom.remove({ _id: req.params.id });
    await SchatChat.remove({ room: req.params.id });
    res.send('ok');

    //채팅방과 채팅내역 삭제 2초뒤에 /schat/room 네임스페이스에 방이 삭제됨을 알림.
    setTimeout(() => {
      req.app.get('io').of('/schat/room').emit('removeRoom', req.params.id);
    }, 2000);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post('/room/:id/chat', async (req, res, next) => { console.log(123455);
  try {
    const chat = new SchatChat({
      room: req.params.id,
      user: req.session.color,
      chat: req.body.chat,
    });
    await chat.save();

    req.app.get('io').of('/schat/chat').to(req.params.id).emit('chat', chat);
    res.send('ok');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

fs.readdir('uploads/schat/img', (err) => {
  if (err) {
    console.log('uploads/schat/img 폴더가 없어 생성합니다.');
    fs.mkdirSync('uploads/schat/img', { recursive: true });
  }
});
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/schat/img/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});
router.post('/room/:id/gif', upload.single('gif'), async (req, res, next) => {
  try {
    const chat = new SchatChat({
      room: req.params.id,
      user: req.session.color,
      gif: req.file.filename,
    });
    await chat.save();

    req.app.get('io').of('/schat/chat').to(req.params.id).emit('chat', chat);
    res.send('ok');
  } catch (err) {
    console.error(err);
    next(err);
  }
});


/*
router.get('/', (req, res) => {
  res.render('schat/index');
});
*/

module.exports = router;