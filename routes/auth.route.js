const router = require('express').Router()
const { register, login, logout, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { setAccept } = require('../middleware/setAccept');
const { setContentSecurityPolicy } = require('../middleware/setCsp');
const { setGzip } = require('../middleware/setGzip');


router.post('/register', setAccept, setContentSecurityPolicy, setGzip, register);

router.post('/login', setAccept, setContentSecurityPolicy, setGzip, login);

router.get('/logout', setAccept, setContentSecurityPolicy, setGzip, logout);

router.get('/me', protect, setAccept, setContentSecurityPolicy, setGzip, getMe);

module.exports = router