module.exports = (sequelize, DataTypes) => {
  //기본적으로 모델이름은 단수형(Ex: user), 테이블 이름은 복수형(Ex: users)로 사용.
  return sequelize.define('user', {
    //squelize는 기본적으로 id를 기본키로 연결하므로 id컬럼은 적어줄 필요 없음.
    name: {
      //VARCHAR
      type: DataTypes.STRING(20),
      //NOT NULL
      allowNull: false,
      //UNIQUE
      unique: true,
    },
    age: {
      //UNSIGNED, (Ex: UNSIGNED ZEROFILL => DataTypes.INTEGER.UNSIGNED.ZEROFILL)
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    married: {
      //TINYINT
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      //NULL
      allowNull: true,
    },
    created_at: {
      //DATETIME
      type: DataTypes.DATE,
      allowNull: false,
      //DEFAULT, Datatypes.NOW == now()
      defaultValue: sequelize.literal('now()'),
    },
  }, {
    //세번째 인자는 테이블 옵션. 한글 문제가 생긴다면 charset, collate 속성 추가 필요.
    /*많이 사용하는 테이블 옵션
    1. paranoid: timestamp: true여야 사용가능. true 설정시 deletedAt 컬럼 추가됨.
                로우 삭제 명령시 제거 대신 deletedAt에 삭제 날짜 입력, 조회 시에는
                deletedAt 값이 null인 로우만 조회. => 데이터 복구를 위한
                실무서 timestamp, paranoid를 true로 자주 사용
    2. underscored: createdAt, updatedAt, deletedAt, 시퀄라이저가 자동 생성하는 관계
                컬럼들의 이름을 스네이크케이스 형식으로 변환. (Ex: createdAt-> created_at)
    3. tableName: 테이블 이름을 다른것으로 설정. 시퀄은 기본으로 define메서드의 첫번째
                인자를 복수형으로 만들어 테이블 이름 사용. (Ex: user-> users). 자동 변환 막음.
    */
    //true로 되어 있으면 createdAt, updatedAt 컬럼이 추가 되고 생성, 수정시 자동 입력됨
    timestamps: false,
  });
};
