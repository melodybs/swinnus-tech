//Server Sent Event: 서버가 클라이언트로 보내는 단방향 통신
const SSE = require('sse');

module.exports = (server) => {
  const sse = new SSE(server);

  //connection 이벤트로 클라이언트와 연결시 어떤 동작을 할지 정의 할 수 있다.
  //매개변수로 client객체를 사용가능. 라우터에서 SSE를 사용하고 싶다면
  //app.set 메서드로 등록하고, req.app.get 메서드로 가져오면 됩니다.
  sse.on('connection', (client) => {
    setInterval(() => {
      //client.send메서드로 보낼 수 있는데, 문자열만 가능하므로 변환해 보냄.
      client.send(new Date().valueOf().toString());
    }, 1000);
  });
}