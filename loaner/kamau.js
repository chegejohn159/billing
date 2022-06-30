const { Elarian } = require('elarian');

const client = new Elarian({
    orgId: 'el_org_eu_M8GGTK',
    appId: 'el_app_iHlqeC',
    apiKey: 'el_k_test_68ebaa47e66a5e2820db7e9beb78065538f19976170079522a02dec55b56d9ac'
});

const whatsappChannel = {
    number: '+254701020901',
    channel: 'whatsapp',
};

const paymentChannel = {
    number: '254254',
    channel: 'cellular',
};

const purseId = 'el_prs_ICzqJH';

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

// async function onReceivedTelegram(notification, customer) {
//     console.log(`Received telegram message -> ${notification}`);
// }


// async function onReceivedWhatsapp(notification, customer) {
//     console.log(`Received Whatsapp message -> ${notification}`);
// }

client
    .on('error', (err) => console.error(`Connnection error: ${err}`))
    .on('connected', onConnected)
    //.on('receivedTelegram', onReceivedTelegram)
    //.on('receivedWhatsapp', onReceivedWhatsapp)
    .connect();


const { Elarian } = require('elarian');

const client = new Elarian({
    orgId: 'el_org_eu_M8GGTK',
    appId: 'el_app_iHlqeC',
    apiKey: 'el_k_test_68ebaa47e66a5e2820db7e9beb78065538f19976170079522a02dec55b56d9ac'
});

const whatsappChannel = {
    number: '+254701020901',
    channel: 'whatsapp',
};

const paymentChannel = {
    number: '254254',
    channel: 'cellular',
};

const purseId = 'el_prs_ICzqJH';

// async function onConnected () {
//     console.log('App is running!');
//
//     const alice = new client.Customer({
//         number: '+254701020901',
//         provider: 'cellular'
//     });
//
//     // await alice.sendMessage(
//     //     {
//     //         number: 'andson',
//     //         channel: 'telegram'
//     //     },
//     //     { body: { text: 'Hello simon!' } },
//     // );
//
//     await alice.sendMessage(
//         {
//             number: '+254701020901',
//             channel: 'whatsapp'
//         },
//         { body: { text: 'Hello simon!' } },
//     );
// }
//
// // async function onReceivedTelegram(notification, customer) {
// //     console.log(`Received telegram message -> ${notification}`);
// // }
//
//
// async function onReceivedWhatsapp(notification, customer) {
//     console.log(`Received Whatsapp message -> ${notification}`);
// }
//
// client
//     .on('error', (err) => console.error(`Connnection error: ${err}`))
//     .on('connected', onConnected)
//     //.on('receivedTelegram', onReceivedTelegram)
//     .on('receivedWhatsapp', onReceivedWhatsapp)
//     .connect();
//
//

async function onConnected () {
    console.log('App is running!');

    const alice = new client.Customer({
        number: '+254701020901',
        provider: 'cellular'
    });

    await alice.sendMessage(
        {
            number: '+254701020901',
            channel: 'whatsapp'
        },
        { body: { text: 'Hello chege!' } },
    );
}

async function onReceivedWhatsapp(notification, customer, appData, callback) {
    const input = notification.text;
    let status = (appData || {}).status || 'can-borrow';
    const amount = (appData || {}).amount || 100;
    let remindersSent = (appData || {}).remindersSent || 0;

    let response = 'Welcome to Loaner. Send request-loan to begin loan disbursement';

    if (status === 'can-not-borrow') {
        response = `You still owe USD ${amount}. Please pay through payment number ${paymentChannel.number}`;
    } else if (input.trim().toLowerCase() === 'request-loan') {
        response = 'We are processing your request. We\'ll be in touch shortly.';
        status = 'can-not-borrow';
        remindersSent = 0;
        setTimeout(async () => {
            await client.initiatePayment(
                { purseId },
                {
                    channelNumber: paymentChannel,
                    customerNumber: customer.customerNumber,
                },
                { amount, currencyCode: 'USD' }
            );
            await customer.cancelReminder('loaner');
            await customer.addReminder({
                key: 'loaner',
                payload: `USD ${amount}`,
                remindAt: (Date.now() + 6000) / 1000, // 1m from now
            });
            await customer.sendMessage(
                whatsappChannel,
                { body: { text: `Hi! Your loan of USD ${amount} has been approved.` } },
            );
        }, 5000);
    }

    await customer.replyToMessage(
        notification.messageId,
        { body: { text: response } },
    );

    const newAppData = {
        status,
        amount,
        remindersSent,
    };
    callback(null, newAppData);
}

async function onReminder(notification, customer, appData, callback) {
    const loan = notification.reminder.payload;
    const { remindersSent = 0 } = appData;
    const newReminderCount = remindersSent + 1;

    await customer.sendMessage(
        whatsappChannel,
        { body: { text: `Hi, your loan repayment of ${loan} is due! (reminder ${newReminderCount})` } },
    );

    if (newReminderCount <= 5) {
        await customer.addReminder({
            key: 'loaner',
            payload: loan,
            remindAt: (Date.now() + 60000) / 1000, // 1m from now
        });
    }

    const newAppData = {
        ...appData,
        remindersSent: newReminderCount,
    };
    callback(null, newAppData);
}

async function onReceivedPayment(notification, customer, appData, callback) {
    const { amount, currencyCode } = notification.value;

    await customer.sendMessage(
        whatsappChannel,
        { body: { text: `Hi, your payment of ${currencyCode} ${amount} has been received!` } },
    );
    await customer.cancelReminder('loaner');

    const newAppData = {
        status: 'can-borrow',
    };
    callback(null, newAppData);
}

client
    .on('error', (err) => console.error(err))
    .on('reminder', onReminder)
    .on('receivedWhatsapp', onReceivedWhatsapp)
    .on('receivedPayment', onReceivedPayment)
    .on('connected', onConnected)
    .connect();
