const m = require('./language/en')
const express = require('express')
const cors = require('cors')
const cron = require('node-cron');
require('dotenv').config();
const app_routing = require('./modules/app_routing');
const middleware = require('./middleware/validators');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000', // your frontend origin
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'api-key'], // Allow custom headers
}));

app.use(express.json());
app.use(express.text());

app.use(express.static("./public"))

// extracting language from header
app.use('/', middleware.extractHeaderLanguage);
app.use('/', middleware.validateApiKey);
app.use('/', middleware.validateHeaderToken);


app_routing.v1(app);


const port = process.env.port || 3000;
app.listen(port, () => {
    console.log("Server running on port :", port);
});

// api documentation
// https://documenter.getpostman.com/view/33413814/2sAYkDNgGf






