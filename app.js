var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');
//var expressEjsLayouts = require('express-ejs-layouts');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

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
app.use(logger('dev'));

/*static 미들웨어. express 내장
  인자로 정적 파일들이 담긴 폴더 지정 
  자체적으로 정적 파일 라우팅 기능 수행하므로 최대한 위쪽 배치: 쓸데없는 미들웨어 작업 방지, 로그 찍기 위해 로그 다음.*/
app.use(express.static(path.join(__dirname, 'public')));

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
  app.use(cookieParser('secret code'));

/*express-session 미들웨어: req.session, req.sessionID, req.session.destroy()...*/
app.use(session({
  resave: true, //요청 왔을때 세션에 수정 사항 없어도 세션 다시 저장 할지
  saveUninitialized: true, //세션에 저장할 내역이 없더라도 저장할지. 보통 방문자 추적에 사용
  secret: 'secret code', //필수 항목. cookie-parser 비밀키와 같은 역할로 cookie-parser의 secret과 동일하게 설정 해야함.  
  cookie: { //세션쿠키 설정: maxAge, domain, path, expire, sameSite, httpOnly, secure 등
    httpOnly: true, //클라이언트에서 쿠키 확인 못하도록 true
    secure: false, //http에서도 사용가능하게. https 도입후 true 변경
    //store: //서버 재시작시 세션 사라짐. 데이터베이스를 연결해 세션 유지
  },
}));

/*flash 미들웨어: 일회성 메시지를 웹 브라우저에 나타낼때. req.flash...
app.use(flash());*/

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
