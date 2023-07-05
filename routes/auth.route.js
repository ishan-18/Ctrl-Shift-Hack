const router = require('express').Router()
const { register, login, logout, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { setAccept } = require('../middleware/setAccept');
const { setContentSecurityPolicy } = require('../middleware/setCsp');
const { setGzip } = require('../middleware/setGzip');


router.post('/register', setAccept, setContentSecurityPolicy, register);

router.post('/login', setAccept, setContentSecurityPolicy, login);

router.get('/logout', setAccept, setContentSecurityPolicy, logout);

router.get('/me', protect, setAccept, setContentSecurityPolicy, setGzip, getMe);

module.exports = router