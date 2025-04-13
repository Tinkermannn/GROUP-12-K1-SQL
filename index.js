const express = require("express");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;

const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');

app.use(rateLimit({
    windowMs: 1 * 60 * 1000, // 15 menit
    max: 1000, // maksimal 100 request per IP per 15 menit
    message: {
        success: false,
        message: "Too many requests, please try again later.",
        payload: null
    }
}));

const userRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5000,
    keyGenerator: (req) => {
        try {
            return req.user?.id || req.ip;
        } catch {
            return req.ip;
        }
    }
});

app.set('trust proxy', 1);

app.use(cors({
    origin: 'https://os.netlabdte.com', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'] 
}));



app.use(helmet());

app.use(express.json());

app.use(xss());  

const storeRouter = require('./src/routes/store.route'); 
const userRouter = require('./src/routes/user.route');
const itemRouter = require('./src/routes/item.route')
const transactionRouter = require('./src/routes/transaction.route')

app.use('/transaction', userRateLimiter, transactionRouter);
app.use('/store', storeRouter);
app.use('/user', userRouter);
app.use('/item', itemRouter);


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
        payload: null
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
