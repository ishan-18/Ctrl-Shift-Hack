const router = require('express').Router({mergeParams: true});
const { getAnimalsInRadius, getAnimals, createAnimal, getAnimal, updateAnimal, deleteAnimal, getAnimalsRescuedByNGO } = require('../controllers/animal.controller');
const {protect, authorize} = require('../middleware/auth');
const { setAccept } = require('../middleware/setAccept');
const { setContentSecurityPolicy } = require('../middleware/setCsp');
const { setGzip } = require('../middleware/setGzip');


router.route('/radius/:zipcode/:distance')
.get(protect, setAccept, setContentSecurityPolicy, setGzip, getAnimalsInRadius)

router.route('/')
.get(protect, setAccept, setContentSecurityPolicy, setGzip, getAnimals)
.post(protect, setAccept, setContentSecurityPolicy, createAnimal)

router.route('/:id')
.get(protect, setAccept, setContentSecurityPolicy, setGzip, getAnimal)
.put(protect, setAccept, setContentSecurityPolicy, updateAnimal)
.delete(protect, setAccept, setContentSecurityPolicy, deleteAnimal)

router.route('/ngo/:ngoid')
.put(protect, setAccept, setContentSecurityPolicy, getAnimalsRescuedByNGO)

module.exports = router