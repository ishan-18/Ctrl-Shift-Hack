const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db')
const colors = require('colors');
const errorHandler = require('./middleware/error');
const fileupload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const xssClean = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')
const https = require('https')
const fs = require('fs')
const compression = require('compression')
const redis = require('redis-promisify');
const treblle = require('@treblle/express')

dotenv.config({ path: './config/.env' })

connectDB();

const app = express();

//Integrated Treblle Platform
app.use(
    treblle({
        apiKey: process.env.TREBLLE_API_KEY,
        projectId: process.env.TREBLLE_PROJECT_ID,
        additionalFieldsToMask: ['password', 'email', 'token', 'cookie', 'authorization'],
        showErrors: true
    })
)

//Created Redis Client
exports.client = redis.createClient();

app.use(express.json())
app.use(cookieParser())
// app.set('trust proxy', true);


app.use(compression({
    level: 6,
    threshold: 0
}))



//Set Accept Header
// app.use(function (req, res, next) {
//     res.setHeader('Accept', 'application/json')
//     next();
// });


//For File uploading
app.use(fileupload())

//Sanitize data 
//{"gt": ""}
app.use(mongoSanitize())

//Set security headers
app.use(helmet())

//prevent cross-site scripting tags
//<script>alert(1)</script>
app.use(xssClean())


//Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100
})
app.use(limiter)

//Prevent http param pollution
app.use(hpp())

// Middleware to set X-Frame-Options header
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'deny');
    next();
});

//Enable CORS
app.use(cors())


if (process.env.NODE_ENV === 'development') {
    app.use(morgan(
        'dev'
    ));
}

//Static upload 
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/api/v1/auth', require('./routes/auth.route'))
app.use('/api/v1/ngos', require('./routes/ngo.route'))
app.use('/api/v1/animals', require('./routes/animal.route'))


app.use(errorHandler);


//Starting the server
const PORT = process.env.PORT || 5000;

const sslServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))
}, app)

const server = sslServer.listen(PORT,'0.0.0.0', () => {
    console.log(`Secure Server Listening in ${process.env.NODE_ENV} on port ${process.env.PORT} 🚀`.yellow.bold)
})

// Handle Unhandled rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error ${err.message}`.red.bold)

    server.close(() => process.exit(1));
})

