const router = require('express').Router();
const { getNGOs, createNGO, getNGO, updateNGO, deleteNGO, getNGOsInRadius } = require('../controllers/ngo.controller');
const {protect, authorize} = require('../middleware/auth');
const { setAccept } = require('../middleware/setAccept');
const { setContentSecurityPolicy } = require('../middleware/setCsp');
const { setGzip } = require('../middleware/setGzip');

router.route('/')
.get(protect, setAccept, setContentSecurityPolicy, setGzip, getNGOs)
.post(protect, authorize('ngouser', 'admin'), setAccept, setContentSecurityPolicy, setGzip, createNGO);

router.route('/:id')
.get(protect, setAccept, setContentSecurityPolicy, setGzip, getNGO)
.put(protect, authorize('ngouser', 'admin'), setAccept, setContentSecurityPolicy, setGzip, updateNGO)
.delete(protect, authorize('ngouser', 'admin'), setAccept, setContentSecurityPolicy, setGzip, deleteNGO);

router.route('/radius/:zipcode/:distance')
.get(protect, setAccept, setContentSecurityPolicy, setGzip, getNGOsInRadius)

module.exports = router