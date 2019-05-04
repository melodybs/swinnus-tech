/*
Passport 모듈은 req 객체에 isAuthenticated 메서드를 추가해 줌.
로그인 중이면 true, 아니면 false 리턴.
*/
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send('로그인 필요');
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/sbird');
  }
}