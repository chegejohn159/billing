const express = require('express');
const hello = require('./routes/hello');
const cors = require('cors');
const PORT = process.env.PORT || 8081;
// const connectEnsureLogin = require('connect-ensure-login');

const app = express();
app.use(cors())
app.use('/api/test', hello);

app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
});
