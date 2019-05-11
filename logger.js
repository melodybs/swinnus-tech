/*winston
실제 서버 운영시 console.log와 console.error를 대체하기 위한 모듈. 로그를 파일이나 DB로 저장.
사용방벙이 다양하니 공식문서 참고해서 활용하기!
*/
const { createLogger, format, transports } = require('winston');
//로그를 날짜별로 관리할수 있게 해주는 패키지
require('winston-daily-rotate-file');

//createLogger 메서드로 logger를 만들고, 인자로 logger 설정을 넣어줌.
const logger = createLogger({
  //level은 로그의 심각도. 상위 단계를 고르면 하위단계 에러도 함께 기록됨.
  //error < warn < info < verbose < debug < silly
  level: 'info',
  //로그의 형싱. 기본적으로 json형식으로 기록하지만 로그 기록 시간이 필요하면 timestamp.
  //combinedms 여러 형식을 혼합할때 사용.
  //json, label, timestamp, printf, simple, combine
  format: format.json(),
  /*format: format.combine(
    format.splat(),
    format.simple()
  ),*/
  //로그 저장 방식. new transports.File은 파일로 저장. new transports.Console은 콘솔에 출력.
  //여러 로깅 방식을 동시에 사용 가능. 이 메서드에도 level, format등을 설정 가능.
  transports: [
    new transports.File({ filename: 'log/combined.log' }),
    new transports.File({ filename: 'log/error.log', level: 'error' }),
    new transports.File({ filename: 'log/warn.log', level: 'warn' }),
    new transports.File({ filename: 'log/info.log', level: 'info' }),
    new transports.File({ filename: 'log/verbose.log', level: 'verbose' }),
    new transports.File({ filename: 'log/debug.log', level: 'debug' }),
    new transports.File({ filename: 'log/silly.log', level: 'silly' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({ format: format.simple() }));
}

module.exports = logger;
