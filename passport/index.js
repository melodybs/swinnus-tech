const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const { SbirdUser, SauctionUser } = require('../models');

/* 로그인 진행 과정
로그인요청-> passport.authenticate() 호출-> 로그인전략 수행
->로그인 성공시 [사용자정보객체 AND req.login() 호출]
-> req.login()이 passport.serializeUser() 호출-> req.session에 사용자 ID만 저장
-> 로그인 완료

로그인 이후 과정
모든 요청에 passport.session()미들이 passport.deseralizeUser() 호출
-> req.session에 저장된 ID로 디비에서 사용자 조회-> 조회된 정보를 req.user에 저장
-> 라우터에서 req.user 객체 사용 가능.
*/
module.exports = (passport) => {
  /*
  serializeUser는 req.session객체에 어떤 데이터를 저장할지 선택함.
  첫번째 인자로 user를 받아, done 함수의 두번째 인자로 user.id를 넘김.
  done 함수의 첫번째 인자는 에러 발생시 사용하는 것임.
  세션에 사용자 정보를 모두 저장하면 용량이 커지고 데이터 일관성 문제사 있어 ID만 저장
  */
  passport.serializeUser((user, done) => {
    //done(null, user.id);
    let userPrototype =  Object.getPrototypeOf(user); 
    //let userGroup = "sbird";
    
    if (userPrototype === SbirdUser.prototype) {
        userGroup = "sbird";
    } else if (userPrototype === SauctionUser.prototype) {
        userGroup = "sauction";
    } 

    let sessionConstructor = new SessionConstructor(user.id, userGroup, '');
    done(null, sessionConstructor);
  });

  /*
  deserializeUser는 매 요청시 실행됨. passport.session() 미들웨어가 이 메서드 호출.
  serializeUser에서 세션에 저장한 아이디를 받아 디비에서 사용자 정보를 조회하고
  조회한 정보를 req.user에 저장하므로 앞으로 req.user를 통해 사용자 정보 가져올 수 있음.
  */
 passport.deserializeUser((sessionConstructor, done) => {
   const id = sessionConstructor.userId;
/* SBIRD */
  if (sessionConstructor.userGroup == 'sbird') {
    SbirdUser.findOne({
      where: { id },
      //팔로잉/팔로워 목록도 함께 가져온다.
      include: [{
        model: SbirdUser,
        attributes: ['id', 'nick'],
        as: 'Followers',
      }, {
        model: SbirdUser,
        attributes: ['id', 'nick'],
        as: 'Followings',
      }],
    })
      .then(user => done(null, user))
      .catch(err => done(err));
/* END SBIRD */
/* SAUCTION */
  } else if (sessionConstructor.userGroup == 'sauction') {
    SauctionUser.findOne({ where: { id } })
      .then(user => done(null, user))
      .catch(err => done(err));
/* END SAUCTION */
  }
});

  local(passport);
  kakao(passport);
};

function SessionConstructor(userId, userGroup, details) {
  this.userId = userId;
  this.userGroup = userGroup;
  this.details = details;
}
