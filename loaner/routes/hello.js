const express = require('express');

const { Elarian } = require('elarian');

const router = express.Router();

const client = new Elarian({
  orgId: 'el_org_eu_ITlMFV',
  appId: 'el_app_Qao7WM',
  apiKey: 'el_k_live_1a877469e2fe43f2f34938a082153365cd50b5c0c7098095efe03c1627d0be9b'
});

const whatsappChannel = {
  number: '+254701020901',
  channel: 'whatsapp',
};
/* GET home page. */
router.get('/', (req, res) => {

  async function onConnected () {
    console.log('App is running!');

    const alice = new client.Customer({
      number: '+254701020901',
      provider: 'cellular'
    });

    // await alice.sendMessage(
    //     {
    //       number: '21500',
    //       channel: 'sms'
    //     },
    //     { body: { text: 'Hello kamau!' } },
    // );

    await alice.sendMessage(
      {
        number: 'chegejohn159_bot',
        channel: 'telegram'
      },
      { body: { text: 'Hello chege, Your Payment is Due!' } },
  );
  }

  client
      .on('error', (err) => console.error(`Connnection error: ${err}`))
      .on('connected', onConnected)
      //.on('receivedTelegram', onReceivedTelegram)
      //.on('receivedWhatsapp', onReceivedWhatsapp)
      .connect();

  res.send({ data: 'Hello from Generate-Express' });
});

module.exports = router;
