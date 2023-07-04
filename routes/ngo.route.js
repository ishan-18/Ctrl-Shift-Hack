const router = require('express').Router();
const { getNGOs, createNGO, getNGO, updateNGO, deleteNGO, getNGOsInRadius } = require('../controllers/ngo.controller');
const {protect, authorize} = require('../middleware/auth');
const { setAccept } = require('../middleware/setAccept');
const { setContentSecurityPolicy } = require('../middleware/setCsp');
const { setGzip } = require('../middleware/setGzip');

router.route('/')
.get(protect, setAccept, setContentSecurityPolicy, getNGOs)
.post(protect, authorize('ngouser', 'admin'), setAccept, setContentSecurityPolicy, createNGO);

router.route('/:id')
.get(protect, setAccept, setContentSecurityPolicy, setGzip, getNGO)
.put(protect, authorize('ngouser', 'admin'), setAccept, setContentSecurityPolicy, updateNGO)
.delete(protect, authorize('ngouser', 'admin'), setAccept, setContentSecurityPolicy, deleteNGO);

router.route('/radius/:zipcode/:distance')
.get(protect, setAccept, setContentSecurityPolicy, getNGOsInRadius)

module.exports = router