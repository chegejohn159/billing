const express = require('express');

const { Elarian } = require('elarian');

const router = express.Router();

const client = new Elarian({
  orgId: 'el_org_eu_M8GGTK',
  appId: 'el_app_iHlqeC',
  apiKey: 'el_k_test_68ebaa47e66a5e2820db7e9beb78065538f19976170079522a02dec55b56d9ac'
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

    await alice.sendMessage(
        {
          number: '21500',
          channel: 'sms'
        },
        { body: { text: 'Hello kamau!' } },
    );

    await alice.sendMessage(
        {
          number: '+254701020901',
          channel: 'whatsapp'
        },
        { body: { text: 'Hello chege!' } },
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
