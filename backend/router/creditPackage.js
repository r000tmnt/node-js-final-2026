const express = require('express');
const appError = require('../utils/appError')
const creditPackageController = require('../controllers/creditPackageController');

const router = express.Router();

router.get('/', async(req, res, next) => {
    try {
        const result = await creditPackageController.getCreditPackages()
        res.status(200).json(result)   
    } catch (error) {
        next(appError(503, error))
    }
});

router.post('/', async(req, res, next) => {
    try {
        const result = await creditPackageController.addCreditPackage(req.body)

        if(result.status !== 'success'){
            next(result)
            return   
        }

        res.status(200).json(result) 
    } catch (error) {
        next(appError(503, error))
    }
})

router.delete('/:id', async(req, res, next) => {
    try {
        const { id } = req.params
        const result = await creditPackageController.deleteCreditPackage(id)

        if(result.status !== 'success'){
            next(result)
            return   
        }

        res.status(200).json(result) 
    } catch (error) {
        next(appError(503, error))
    }
})

module.exports = router