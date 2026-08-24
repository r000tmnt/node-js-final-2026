const appError = require('../utils/appError');
const express = require('express')
const publicController = require('../controllers/publicController')

const router = express.Router()

router.get('/coaches', async(req, res, next) => {
    try {
        const { per, page } = req.query
        const result = await publicController.getCoaches({ per: Number(per), page: Number(page) })
        
        if(result.status !== 'success'){
            next(result)
            return
        }

        res.status(200).json(result)          
    } catch (error) {
        next(appError(503, error))
        return         
    }
})

router.get('/coaches/:coach_id', async(req, res, next) => {
    try {
        const { coach_id } = req.params
        const result = await publicController.getCoach(coach_id)
        
        if(result.status !== 'success'){
            next(result)
            return
        }

        res.status(200).json(result)          
    } catch (error) {
        next(appError(503, error))
        return         
    }
})

router.get('/coaches/:coach_id/courses', async(req, res, next) => {
    try {
        const { coach_id } = req.params
        const result = await publicController.getCourses(coach_id)
        
        if(result.status !== 'success'){
            next(result)
            return
        }

        res.status(200).json(result)          
    } catch (error) {
        next(appError(503, error))
        return         
    }    
})

// router.get('/courses', async(req, res, next) => {})

// router.post('/credit-package/:credit_package_id', async(req, res, next) => {})

// router.get('/users/credit-package', async(req, res, next) => {})

// router.get('/users/courses', async(req, res, next) => {})

module.exports = router