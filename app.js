//var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');
var morgan = require('morgan');
var passport = require('passport');
var ColorHash = require('color-hash');
//npm i dotenv 비밀키는 .env 파일에 넣어두면, dotenv가 process.env 객체에 넣어줌.
require('dotenv').config();
//var expressEjsLayouts = require('express-ejs-layouts');
/*HTTPS 적용: greenlock-express, Let's Encrypt
const lex = require('greenlock-express').create({
  version: 'v02', // draft-11 버전 인증서 사,  letsencrypt 인증서 버전
  configDir: '/etc/letsencrypt', // 또는 ~/letsencrypt/etc, 발급받은 인증서 위치를 넣는 곳
  server: 'production', //staging을 넣어줍니다. 나중에 staging을 production 또는 https://acme-v01.api.letsencrypt.org/directory으로 바꿔줘야 합니다. staging은 테스트용 SSL을 만들어보는 것
  approveDomains: (opts, certs, cb) => { //도메인 이름들을 적어줍니다. 참고로 서브 도메인들은 다 적어줘야 합니다. www가 붙은 것도 서브도메인이기 때문에 넣어주어야 하고요. dev.example.com, api.example.com 등이 있다면 그것 또한 넣어줘야 합니다.
    if (certs) {
      opts.domains = ['swinnus-tech.herokuapp.com', 'herokuapp.com'];
    } else {
      opts.email = 'melody_bs@naver.com';//나중에 만료 예정일 때 이 곳으로 이메일
      opts.agreeTos = true;//agreeTos는 true를 넣어줍니다. agreeTos는 약관 동의라고 생각하시면 됩니다.
    }
    cb(null, { options: opts, certs });
  },
  renewWithin: 81 * 24 * 60 * 60 * 1000, //renewWithin과 renewBy는 각각 인증서를 갱신할 최대 기간과 최소 기간을 뜻합니다. 80일과 81일 사이에(인증서의 수명은 90일) 갱신하도록 했습니다.
  renewBy: 80 * 24 * 60 * 60 * 1000,
});*/

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var commentsRouter = require('./routes/comments');
/* SBIRD */
var sbirdPageRouter = require('./routes/sbird/page');
var sbirdAuthRouter = require('./routes/sbird/auth');
var sbirdPostRouter = require('./routes/sbird/post');
var sbirdUserRouter = require('./routes/sbird/user');
/* END SBIRD */
/* SCHAT */
var schatIndexRouter = require('./routes/schat/index');
/* END SCHAT */
/* SAUCTION */
var sauctionIndexRouter = require('./routes/sauction/index');
var sauctionAuthRouter = require('./routes/sauction/auth');
var checkAuction = require('./schedule/sauction/checkAuction');
/* END SAUCTION */
/* SMAP */
var smapIndexRouter = require('./routes/smap/index');
/* END SMAP */
//sequelize, mysql2, sequelize-cli -g 설치 후에 추가. // ./models는 ./models/index.js와 같음
var sequelize = require('./models').sequelize;
//const sequelize = require('./models');
/* SBIRD */
//npm i passport passport-local passport-kakao bcrypt // './passport' = './passport/index.js'
var passportConfig = require('./passport');
/* END SBIRD */
/* SAUCTION *
var sauctionPassportConfig = require('./passport/sauction/index');
/* END SAUCTION */
//mongoose 설치 후 추가
var mongooseConnect = require('./schemas');

var app = express();
//sync 메서드를 사용하면 서버 실행시 자동으로 MySQL과 연동.
sequelize.sync();
passportConfig(passport);
//mongoose connect 호출
mongooseConnect();
//SAUCTION 경매 낙찰자 확인 스케쥴
checkAuction();

//Socket.IO에서 세션에 접근하기 위해, express-session을 미들웨어 만들어 공유
var sessionMiddleware = session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.COOKIE_SECRET, 
  cookie: { 
    httpOnly: true,
    secure: false,
  },
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
/* pug 사용 */
app.set('view engine', 'pug');
/* ejs 사용: ejs, express-ejs-layouts
app.set('view engine', 'ejs');*/


/*19.04.28 커스텀 미들웨어 테스트, + use에 미들웨어 여러개 장착 테스트
app.use((req, res, next) => {
  console.log(`요청 주소: ${req.url}`);
  next();
}, (req, res, next) => {
  console.log('커스텀 미들웨어 동작 테스트');
  next();
});*/

/*morgan 미들웨어 
  인자: 개발(dev, short) / 상용(common, combined)*/
app.use(morgan('dev'));

/*static 미들웨어. express 내장
  인자로 정적 파일들이 담긴 폴더 지정 
  자체적으로 정적 파일 라우팅 기능 수행하므로 최대한 위쪽 배치: 쓸데없는 미들웨어 작업 방지, 로그 찍기 위해 로그 다음.*/
app.use(express.static(path.join(__dirname, 'public')));

/* SBIRD */
//업로드한 이미지를 제공할 라우터(/sbird/img)도 express.static 미들로 폴더와 연결
app.use('/sbird/img', express.static(path.join(__dirname, 'uploads/sbird/img')));
/* END SBIRD */
/* SCHAT */
//업로드한 이미지를 제공할 라우터(/schat/img)도 express.static 미들로 폴더와 연결
app.use('/schat/img', express.static(path.join(__dirname, 'uploads/schat/img')));
/* END SCHAT */
/* SAUCTION */
//업로드한 이미지를 제공할 라우터(/sauction/img)도 express.static 미들로 폴더와 연결
app.use('/sauction/img', express.static(path.join(__dirname, 'uploads/sauction/img')));
/* END SAUCTION */

/*express-ejs-layouts 미들웨어 : app.set(...); 추가 설정 필요. 문서 확인.
app.use(expressEjsLayouts);*/

/*body-parser 미들웨어. express 4.16.0부터 일부가 내장되어 require하지 않고도 사용 가능
raw 또는 text 형태의 본문 해석하고 싶다면=>
  var bodyParser = require('body-parser');
  app.use(bodyParser.raw()); app.use(bodyParser.text());*/
app.use(express.json());
app.use(express.urlencoded({ extended: false })); //false=querystring 모듈 사용, true=qs 모듈 사용

/*cookie-parser 미들웨어: req.cookies...
  첫번째 인자로 문자열. 제공된 문자열로 서명되 쿠키가 됨. 클라이언트에서 수정시 에러발생
  Ex) app.use(cookieParser()); => app.use(cookieParser('secret code'));*/
app.use(cookieParser(process.env.COOKIE_SECRET));

//app.js와 socket.js 간에 express-session 미들웨어 공유를 위해 변수로 분리.
app.use(sessionMiddleware);
/*express-session 미들웨어: req.session, req.sessionID, req.session.destroy()...
app.use(session({
  resave: true, //요청 왔을때 세션에 수정 사항 없어도 세션 다시 저장 할지
  saveUninitialized: true, //세션에 저장할 내역이 없더라도 저장할지. 보통 방문자 추적에 사용
  secret: process.env.COOKIE_SECRET, //필수 항목. cookie-parser 비밀키와 같은 역할로 cookie-parser의 secret과 동일하게 설정 해야함.  
  cookie: { //세션쿠키 설정: maxAge, domain, path, expire, sameSite, httpOnly, secure 등
    httpOnly: true, //클라이언트에서 쿠키 확인 못하도록 true
    secure: false, //http에서도 사용가능하게. https 도입후 true 변경
    //store: //서버 재시작시 세션 사라짐. 데이터베이스를 연결해 세션 유지
  },
}));*/

/*flash 미들웨어: 일회성 메시지를 웹 브라우저에 나타낼때. req.flash...*/
app.use(flash());
//요청(req)객체에 passport설정을 심는다
app.use(passport.initialize());
//req.session 객체에 passport 정보 저장. req.session객체는 express-session에서 생성 하므로 이것보다 뒤에 연결해야 함.
app.use(passport.session());

//color-hash 패키지. 세션 아이디를 HEX형식의 색상문자열로 바꿔줌.
//해시이므로 같은 세션은 항상 같은 색. 사용자 많으면 중복될 수 있음.
app.use((req, res, next) => {
  if (!req.session.color) {
    const colorHash = new ColorHash();
    req.session.color = colorHash.hex(req.sessionID);
  }
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/comments', commentsRouter);
/* SBIRD */
app.use('/sbird', sbirdPageRouter);
app.use('/sbird/auth', sbirdAuthRouter);
app.use('/sbird/post', sbirdPostRouter);
app.use('/sbird/user', sbirdUserRouter);
/* SBIRD END */
/* SCHAT */
app.use('/schat', schatIndexRouter);
/* END SCHAT */
/* SAUCTION */
app.use('/sauction', sauctionIndexRouter);
app.use('/sauction/auth', sauctionAuthRouter);
/* END SAUCTION */
/* SMAP */
app.use('/smap', smapIndexRouter);
/* END SMAP */


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  //next(createError(404));
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
