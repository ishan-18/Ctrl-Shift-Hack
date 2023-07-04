const router = require('express').Router();
const { getNGOs, createNGO, getNGO, updateNGO, deleteNGO, getNGOsInRadius } = require('../controllers/ngo.controller');
const {protect, authorize} = require('../middleware/auth')

router.route('/')
.get(protect, getNGOs)
.post(protect, authorize('ngouser', 'admin'), createNGO);

router.route('/:id')
.get(protect, getNGO)
.put(protect, authorize('ngouser', 'admin'), updateNGO)
.delete(protect, authorize('ngouser', 'admin'), deleteNGO);

router.route('/radius/:zipcode/:distance')
.get(protect, getNGOsInRadius)

module.exports = router