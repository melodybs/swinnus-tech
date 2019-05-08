const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const schedule = require('node-schedule');

const { SauctionGood, SauctionAuction, SauctionUser } = require('../../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

router.use((req, res, next) => {
  //이렇게 하면 res.render메서드에서 user: req.user를 하지 않아도 됨. 중복 제거.
  //모든 pug템플릿에서 사용자 정보를 변수로 집어 넣음.
  res.locals.user = req.user;
  next();
});

//로그인된 USER가 SauctionUser가 아니면 로그아웃 시킨다.
router.use((req, res, next) => {
  if (req.user) {
    const curUserPrototype = Object.getPrototypeOf(req.user);
    
    if (SauctionUser.prototype !== curUserPrototype) {
      req.logout();
      req.session.destroy();
      res.redirect('/sauction');
    } 
  }
  next();
});

router.get('/', async (req, res, next) => {
  try {
    const goods = await SauctionGood.findAll({
      where: { soldId: null }
    });

    res.render('sauction/main', {
      title: 'SwinnusAuction',
      goods,
      loginError: req.flash('loginError'),
    })
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('sauction/join', {
    title: '회원가입 - SwinnusAuction',
    joinError: req.flash('joinError'),
  });
});

router.get('/good', isLoggedIn, (req, res) => {
  res.render('sauction/good', { 
    title: '상품 등록 - SwinnusAuction' 
  });
});

fs.readdir('uploads/sauction/img', (err) => {
  if (err) {
    console.error('uploads/sauction/img 폴더가 없어 생성 합니다.');
    fs.mkdirSync('uploads/sauction/img', { recursive: true });
  }
});
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/sauction/img');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});
router.post('/good', isLoggedIn, upload.single('img'), async (req, res, next) => {
  try {
    const { name, price } = req.body;
    const good = await SauctionGood.create({
      ownerId: req.user.id,
      name,
      img: req.file.filename,
      price,
    });
    /* node-schedule 24시간후에 낙찰자 정하는 시스템 구현 */
    const end = new Date();
    end.setDate(end.getDate() + 1); // 하루 뒤

    //schedule 객체의 scheduleJob 메서드로 일정을 예약.
    //첫번째 인자로 실행될 시각, 두번째 인자로 해당 시간에 실행할 콜백 함수.
    schedule.scheduleJob(end, async () => {
      const success = await SauctionAuction.findOne({
        where: { sauctionGoodId: good.id },
        order: [['bid', 'DESC']],
      });

      await SauctionGood.update({
        soldId: success.sauctionUserId
      }, {
        where: { id: good.id }
      });
      await SauctionUser.update({
        //시퀄라이즈에서 해당 컬럼 숫자 줄이는 방법. 늘리려면 - 대신 + 사용.
        money: sequelize.literal(`money - ${success.bid}`),
      }, {
        where: { id: success.sauctionUserId },
      });
    });
    /* END node-schedule */
    res.redirect('/sauction');
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/good/:id', isLoggedIn, async (req, res, next) => {
  try {
    const [good, auction] = await Promise.all([
      SauctionGood.findOne({
        where: { id: req.params.id },
        include: {
          model: SauctionUser,
          //good모델과 user모델은 일대다 관계가 2번 연결 되어 있으므로,
          //어떤 관계를 인클루드 할지 as속성으로 밝혀 주어야 합니다.
          as: 'owner',
        }
      }),
      SauctionAuction.findAll({
        where: { sauctionGoodId: req.params.id },
        include: { model: SauctionUser },
        order: [['bid', 'ASC']],
      }),
    ]);

    res.render('sauction/auction', {
      title: `${good.name} - SwinnusAuction`,
      good,
      auction,
      auctionError: req.flash('auctionError'),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post('/good/:id/bid', isLoggedIn, async (req, res, next) => {
  try {
    const { bid, msg } = req.body;
    const good = await SauctionGood.findOne({
      where: { id: req.params.id },
      include: { model: SauctionAuction },
      //인클루드될 컬럼의 정렬하는 방법
      order: [[{ model: SauctionAuction }, 'bid', 'DESC']],
    });

    if (good.price > bid) { //시작 가격보다 낮게 입찰하면
      return res.status(403).send('시작 가격보다 높게 입찰해야 합니다.');
    }

    //경매 종료 시간이 지났으면
    if (new Date(good.createdAt).valueOf() + (24 * 60 * 60 * 1000) < new Date()) {
      return res.status(403).send('경매가 이미 종료 되었습니다.');
    }

    //직전 입찰가와 현재 입찰가 비교
    if (good.sauctionAuctions[0] && good.sauctionAuctions[0].bid >= bid) {
      return res.status(403).send('이전 입찰가보다 높아야 합니다');
    }

    const result = await SauctionAuction.create({
      bid,
      msg,
      sauctionUserId: req.user.id,
      sauctionGoodId: req.params.id,
    });

    req.app.get('sauctionIo').to(req.params.id).emit('bid', {
      bid: result.bid,
      msg: result.msg,
      nick: req.user.nick,
    });

    return res.send('ok');
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

router.get('/list', isLoggedIn, async (req, res, next) => {
  try {
    const goods = await SauctionGood.findAll({
      where: { soldId: req.user.id },
      include: { model: SauctionAuction },
      order: [[{ model: SauctionAuction }, 'bid', 'DESC']],
    });

    res.render('sauction/list', {
      title: '낙찰 목록 - SwinnusAuction',
      goods
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;