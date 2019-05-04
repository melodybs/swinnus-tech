const KakaoStrategy = require('passport-kakao').Strategy;

const { SbirdUser } = require('../models');

module.exports = (passport) => {
  passport.use(new KakaoStrategy({
    //클라이언트 ID는 카카오에서 발급해주는 것. 노출 되면 안되므로 .env파일에 보관
    clientID: process.env.KAKAO_ID,
    //카카오로부터 인증결과를 받을 라우터 주소 
    callbackURL: '/sbird/auth/kakao/callback',
    //profile에는 사용자 정보가 있음. 카카오에서 보내주는 것이니 console.log로 확인후 필요한 정보 사용.
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const exUser = await SbirdUser.findOne({ 
        where: { snsId: profile.id, provider: 'kakao' } 
      });
      if (exUser) {
        done(null, exUser);
      } else {
        const newUser = await SbirdUser.create({
          email: profile._json && profile._json.kaccount_email,
          nick: profile.displayName,
          snsId: profile.id,
          provider: 'kakao',
        });
        done(null, newUser);
      }
    } catch (err) {
      console.error(err);
      done(err);
    }
  }));
};