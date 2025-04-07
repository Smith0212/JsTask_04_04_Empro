const m = require('./language/en')
const express = require('express')
const cron = require('node-cron');
require('dotenv').config();
const app_routing = require('./modules/app_routing');
const middleware = require('./middleware/validators');

const app = express();


app.use(express.json());
app.use(express.text());

// extracting language from header
app.use('/',middleware.extractHeaderLanguage);
app.use('/',middleware.validateApiKey);
app.use('/',middleware.validateHeaderToken);

// cron.schedule('* * * * *', () => {
//     console.log('Running cron job to update order status');
//     updateOrderStatus();
// });

// Schedule the cron job to run daily at midnight for subscription status updates
cron.schedule('0 0 * * *', () => {
    console.log('Running cron job to update subscription status');
    updateSubscriptionStatus();
});

app_routing.v1(app);


const port = process.env.port || 3000;
app.listen(port, () => {
    console.log("Server running on port :", port);
});

// api documentation
// https://documenter.getpostman.com/view/33413814/2sAYkDNgGf






