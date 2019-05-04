const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { SbirdPost, SbirdHashtag, SbirdUser } = require('../../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

fs.readdir('uploads/sbird/img', (err) => {
  if (err) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.'); 
    fs.mkdirSync('uploads/sbird/img', { recursive: true });
  }
});


//multer 모듈에 옵션을 줘 upload 변수에 대입. upload는 미들웨어를 만드는 객체가 됨.
const upload = multer({
  //storage는 파일 저장 방식과 경로, 파일명 등을 설정
  //diskStorage를 사용해 저장경로를 swinnus-tech 아래 uploads/sbird/img폴더로 지정
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/sbird/img');
    },
    //기존이름(file.originalname)+날짜값(new Date().valueOf())+기존확장자(path.extname)
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
    },
  }),
  //최대 용량. 바이트 단위. 10MB
  limits: { fileSize: 5 * 1024 * 1024 },
});

/*
single(): 하나의 이미지. 이미지 하나는 req.file, 나머지 정보는 req.body
array(): 이미지들은 req.file, 나머지 정보는 req.body. 속성 하나에 이미지 여러개. 
fields(): 이미지들은 req.file, 나머지 정보는 req.body. 여러개의 속성에 이미지를 하나씩
        => 둘의 차이점은 body속성의 개수
none(): 모든 정보를 req.body. 이미지를 올리지 않고 데이터만 multipart 형식으로 전송.
*/

//이미지 업로드를 처리하는 라우터
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  //single 메서드에 이미지가 담긴 req.body속성의 이름을 넣어줌. 여기서 속성 이름은 img
  //req.file: fieldname, originalname, encoding, mimetype, destination, filename, path, size
  console.log(req.file);
  res.json({ url: `/sbird/img/${req.file.filename}` });
});

//게시글 업로드를 처리하는 라우터
const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    const post = await SbirdPost.create({
      content: req.body.content,
      img: req.body.url,
      sbirdUserId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s]*/g);
    if (hashtags) {
      const result = await Promise.all(hashtags.map(tag => SbirdHashtag.findOrCreate({
        where: { title: tag.slice(1).toLowerCase() },
      })));
      //게시글과 해쉬태그의 관계를 sbird_postHashtags테이블에 넣습니다.
      await post.addSbirdHashtags(result.map(r => r[0]));
    }
    res.redirect('/sbird');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//해시태그로 조회
router.get('/hashtag', async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect('/sbird');
  }

  try {
    const hashtag = await SbirdHashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      //작성자 정보를 JOIN해서 가져옴.
      posts = await hashtag.getSbirdPosts( { include: [{ model: SbirdUser }] });
    }
    return res.render('sbird/main', {
      title: `${query} | SwinnusBird`,
      user: req.user,
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    return next(error);
  }
});

module.exports = router;