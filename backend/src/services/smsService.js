const { SmsCode } = require('../models');
const { SMS_STUB_CODE } = require('../utils/constants');
const { Op } = require('sequelize');

class SmsService {
  async sendCode(phone) {
    await SmsCode.update({ is_used: true }, { where: { phone, is_used: false } });
    const code = SMS_STUB_CODE;
    const expires_at = new Date(Date.now() + 5 * 60 * 1000);
    await SmsCode.create({ phone, code, expires_at });
    console.log(`[SMS Stub] Code ${code} sent to ${phone}`);
    return true;
  }

  async verifyCode(phone, code) {
    const smsCode = await SmsCode.findOne({
      where: { phone, code, is_used: false, expires_at: { [Op.gt]: new Date() } },
      order: [['created_at', 'DESC']],
    });
    if (!smsCode) return false;
    await smsCode.update({ is_used: true });
    return true;
  }
}

module.exports = new SmsService();
