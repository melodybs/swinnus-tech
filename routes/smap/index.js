const express = require('express');
const util = require('util');
const googleMaps = require('@google/maps');

const SmapHistory = require('../../schemas/smap/history');
const SmapFavorite = require('../../schemas/smap/favorite');

const router = express.Router();
//@google/maps 패키지로 구글지도클라이언트 만드는 방법. createClient()에 API 키 넣어줌.
//생성된 클라이언트에는 places, placesQueryAutoComplete, placeNearBy등의 메서드가 들어 있음.
const googleMapsClient = googleMaps.createClient({
  key: process.env.PLACES_API_KEY,
});

router.get('/', async (req, res, next) => {
  try {
    const favorites = await SmapFavorite.find({});
    res.render('smap/index', { results: favorites });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get('/autocomplete/:query', (req, res, next) => {
  //placesQueryAutoComplete()는 검색어 자동완성 기능(위치, 지역).
  //결과는 response.json.predictions에 담겨 있다. (예상 검색어는 최대 5개 까지 반환 된다.)
  googleMapsClient.placesQueryAutoComplete({
    //input 속성에 검색할 쿼리를 넣어준다
    input: req.params.query,
    //한국어로 설정해야 한국어 결과값을 받을 수 있다.
    language: 'ko',
  }, (err, response) => {
    if (err) {
      return next(err);
    }
    return res.json(response.json.predictions);
  });
});

//장소 검색시 결과값을 반환하는 라우터
router.get('/search/:query', async (req, res, next) => {
  //구들지도클라이언트는 콜백 방식으로 작동. 프로미스 패턴으로 바꿔서 최종적으로 async/await 문법 사용가능 하도록.
  const googlePlaces = util.promisify(googleMapsClient.places);
  const googlePlacesNearby = util.promisify(googleMapsClient.placesNearby);
  const { lat, lng , type } = req.query;

  try {
    //검색 내역을 구현하기 위해 저장.
    const history = new SmapHistory({
      query: req.params.query
    });
    await history.save();

    let response;

    //lat, lng가 제공 되면 places 대신 placesNearby를 사용
    if (lat && lng) {
      response = await googlePlacesNearby({
        //찾을 검색어
        keyword: req.params.query,
        //위도와 경도
        location: `${lat},${lng}`,
        //정렬순서. 현재는 가까운 거리순으로 검색 하독 지정.
        rankby: 'distance',
        /*
        인기순으로 정렬하고 싶다면 rankby대신 반경을 입력하면 반경 내 장소들을 인기순 정렬.
        radius: 5000,
        */
        //검색언어
        language: 'ko',
        //검색 결과를 정확하게 만들고 싶다면 장소 종류를 지정. 종류는 구글 API 문서 참고.
        type,
      });
    } else {
       //places메서드로 장소 검색. 결과값은 response.json.results에 있음.
      response = await googlePlaces({
         //검색어
        query: req.params.query,
        language: 'ko',
        type,
      });
    }

    res.render('smap/result', {
      title: `${req.params.query} 검색 결과`,
      results: response.json.results,
      query: req.params.query,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post('/location/:id/favorite', async (req, res, next) => {
  try {
    const favorite = await SmapFavorite.create({
      placeId: req.params.id,
      name: req.body.name,
      location: [req.body.lng, req.body.lat],
    });

    res.send(favorite);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;