async function updateSystemSettings(req, res) {
  const {timezone, language} = req.body || {};

  return res.json({
    success: true,
    settings: {
      timezone: timezone || 'Europe/Helsinki',
      language: language || 'fi',
    },
  });
}

async function testSmtp(req, res) {
  const {smtpServer, senderAddress} = req.body || {};
  if (!smtpServer || !senderAddress) {
    return res.status(400).json({
      success: false,
      error: 'smtpServer and senderAddress are required',
    });
  }

  return res.json({
    success: true,
    message: 'SMTP settings accepted for test',
  });
}

module.exports = {
  updateSystemSettings,
  testSmtp,
};
