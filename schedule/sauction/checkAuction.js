//node-schedule의 단덤은 노드가 종료되면 스케줄 예약도 종료되 버림
//서버가 시작될때 경매 시작 후 24시간이 지났지만 낙찰자가 없는 경매를 찾아 낙찰자를 지정하는 코드 추가.
const { SauctionGood, SauctionAuction, SauctionUser, sequelize } = require('../../models');

module.exports = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const targets = await SauctionGood.findAll({
      where: {
        soldId: null,
        createdAt: { $lte: yesterday },
      },
    });

    targets.forEach(async (target) => {
      const success = await SauctionAuction.findOne({
        where: { goodId: target.id },
        order: [['bid', 'DESC']],
      });

      await SauctionGood.update({
        soldId: success.sauctionUserId 
      }, {
        where: { id: target.id }
      });

      await SauctionUser.update({
        money: sequelize.literal(`money - ${success.bid}`),
      }, {
        where: { id: success.sauctionUserId },
      });
    });
  } catch (err) {
    console.error(err);
  }
};