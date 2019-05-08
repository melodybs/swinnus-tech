/**
 * Sbird Login
 */
exports.sbirdLogin = (req, res, next) => {
  passport.authenticate('sbird-local', (authErr, user, info) => {
    if (authErr) {
      console.error(authErr);
      return next(authErr);
    }

    if(!user) {
      req.flash('loginError', info.message);
      return redirect('/sbird');
    }

    return req.login(user, (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }
      return res.redirect('/sbird');
    });
  })(req, res, next);
};

/**
* Sauction Login
*/
exports.sauctionLogin = (req, res, next) => {
  passport.authenticate('sauction-local', (authErr, user, info) => {
    if (authErr) {
      console.error(authErr);
      return next(authErr);
    }

    if(!user) {
      req.flash('loginError', info.message);
      return redirect('/sauction');
    }

    return req.login(user, (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }
      return res.redirect('/sauction');
    });
  })(req, res, next);
};