//const WebSocket = require('ws');
//ws 패키지 대신에 Socket.IO로 변경
const SocketIO = require('socket.io');
const axios = require('axios');
const ColorHash = require('color-hash');

/*
특정인에게 메시지 보내기(방 아이디 대신에 소켓 아이디를 넣으면 됨)
-> socket.to(소켓 아이디).emit(이벤트, 데이터);
나를 제외한 나머지 사람에게 메시지 보내기(socket의 broadcast 객체 이용)
-> socket.broadcast.emit(이벤트, 데이터);
   socket.broadcast.to(방아이디).emit(이벤트,데이터);
*/
module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server, { path: '/schat/socket.io' });

  //라우터에서 io객체를 사용할 수 있도록 저장. req.app.get('io')로 접근 가능
  app.set('io', io);
  //of()로 네임스페이스 지정. 기본은 /네임스페이스. 같은 네임스페이스 끼리 통신.
  const room = io.of('/schat/room');
  const chat = io.of('/schat/chat');

  //io.use()에 미들웨어를 장착할 수 있음. 모든 웹소켓 연결마다 실행. (요청객체, 응답객체, next)
  io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
  });

  room.on('connection', (socket) => {
    console.log('/schat/room 네임스페이스에 접속');

    socket.on('disconnect', () => {
      console.log('/schat/room 네임스페이스 접속 해제');
    });
  });

  chat.on('connection', (socket) => {
    console.log('/schat/chat 네임스페이스에 접속');
    /*
    Socket.IO에는 네임스페이스보다 세부적인 개념인 방이 있음.
    같은 네임스페이스 안에서도 같은 방의 소켓끼리만 데이터를 주고 받음.
    join(), leave()는 방의 아이디를 인자로 받음.
    socket.request.headers.referer를 통해 현재 웹페이지의 URL을 가져올 수 있음.
    URL에서 방 아이디 부분을 추출.
    */
    const req = socket.request;
    const { headers: { referer } } = req;
    const roomId = referer
      .split('/')[referer.split('/').length - 1]
      .replace(/\?.+/, '');
    const colorHash = new ColorHash();
    req.session.color = colorHash.hex(req.sessionID);
    
    //방에 들어가는 메서드.
    socket.join(roomId);
    //socket.to(방아이디)로 특정 방에 데이터를 보낼 수 있음.
    socket.to(roomId).emit('join', {
      user: 'system',
      chat: `${req.session.color}님이 입장하셨습니다.`,
    });

    socket.on('disconnect', () => {
      console.log('/schat/chat 네임스페이스 접속 해제');
      //방에서 나가는 메서드. 접속 끊기면 자동으로 나가지만 확실히 나가도록 추가.
      socket.leave(roomId);
      //socket.adapter.rooms[방아이디]에 참여 중인 소켓 정보가 들어 있음.
      const currentRoom = socket.adapter.rooms[roomId];
      const userCount = currentRoom ? currentRoom.length : 0;

      if (userCount === 0) {
        axios.delete(`http://localhost:80/schat/room/${roomId}`)
          .then(() => {
            console.log('방 제거 요청 성공');
          })
          .catch((error) => {
            console.error(error);
          });
      }  else {
        socket.to(roomId).emit('exit', {
          user: 'system',
          chat: `${req.session.color}님이 퇴장 하셨습니다.`,
        });
      }
    });
  });
};

/*
module.exports = (server) => {
  //두번째 인자는 옵션 객체. 서버 여러 설정 가능. 
  //path옵션은 클라이언트와 연결할 수 있는 경로를 의미
  const io = SocketIO(server, { path: '/schat/socket.io' });

  //connection 이벤트: 클라가 접속 했을때 발생.
  io.on('connection', (socket) => {
    //socket.request 속성으로 요청 객체에 접급. socket.request.res로는 응답객체에 접근.
    //socket.id로 고유아이디 가져올수 있음. 소켓 주인 특정 가능.
    const req = socket.request;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('새로운 클라이언트 접속!', ip, socket.id, req.ip);

    //클라가 연결 끊었을때.
    socket.on('disconnect', () => {
      console.log('클라이언트 접속 해제', ip, socket.id);
    });

    //통신과정중 에러가 발생했을때.
    socket.on('error', (error) => {
      console.error(error);
    });

    //사용자 이벤트. 클라가 reply라는 이벤트명으로 데이터를 보내면 서버가 이렇게 받음.
    socket.on('reply', (data) => {
      console.log(data);
    });

    socket.interval = setInterval(() => {
      //emit의 첫번째 인자는 이벤트명, 두번째 인자는 데이터
      //클라이언트는 news라는 이벤트명으로 리스너를 만들어야 데이터를 받을 수 있음.ㅉ
      socket.emit('news', 'Hello Socket.IO');
    }, 5000);
  });
};
*/

/* ws패키지 사용 코드
module.exports = (server) => {
  //ws 모듈을 불러온 후 서버를 웹소켓 서버와 연결. HTTP와 WS는 포트를 공유할 수 있어 별도 작업이 필요 없음.
  const wss = new WebSocket.Server({ server });

  //wss(웹소켓서버)에 이벤트 리스너를 붙여줌. 웹소켓은 이벤트 기반으로 작동.
  //connection 이벤트는 클라가 서버와 연결을 맺을때 발생.
  wss.on('connection', (ws, req) => {
    //클라이언트 IP를 알아내는 방법. proxy-addr패키지를 사용해 알아낼 수도 있음. 크롬 로컬호스트는 ::1로 표시됨.
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('새로운 클라이언트 접속', ip);

    //ws(웹소켓객체)
    //message: 클라로부터 메시지가 왔을때 // error: 웹소켓 연결중 문제발생 // close: 클라와 연결 끊길때. 
    ws.on('message', (message) => {
      console.log(message);
    });

    ws.on('error', (error) => {
      console.error(error);
    })

    ws.on('close', () => {
      console.log('클라이언트 접속 해제', ip);
      //제거 하지 않으면 메모리 누수가 발생함. 주의.
      clearInterval(ws.interval);
    });

    const interval = setInterval(() => {
      //웹소켓은 4가지 상태 있음. CONNECTING(연결중)/OPEN(열림)/CLOSING(닫는중)/CLOSED(닫힘)
      //OPEN일때만 에러없이 메시지 보내는것이 가능 하기 때문에 확인.
      if (ws.readyState === ws.OPEN) {
        ws.send('서버에서 클라이언트로 메시지를 보냅니다.');
      }
    }, 3000);
    ws.interval = interval;
  });
};
*/