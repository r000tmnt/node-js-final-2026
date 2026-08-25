const express = require('express')
const appError = require('../utils/appError')
const isCoach = require('../middleware/isCoach')
const { dataSource } = require('../db/data-source')
const { isValidString } = require('../utils/validator')
const isAuth = require('../middleware/isAuth')
const coachController = require('../controllers/coachController')

const router = express.Router()

router.get('/courses', isAuth, isCoach, async(req, res, next) => {
    try {
        const { user } = req
        
        const result = await coachController.getCourses(user.id)

        if(result.status !== 'success'){
            next(result)
            return
        }

        res.status(200).json(result)  
    } catch (error) {
        console.log(error)
        next(appError(503, error))
        return 
    }
})

router.post('/courses', isAuth, isCoach, async(req, res, next) => {
    try {
        const { user } = req
        
        const result = await coachController.addCourse({user_id: user.id, ...req.body})

        if(result.status !== 'success'){
            next(result)
            return
        }

        res.status(201).json(result)  
    } catch (error) {
        next(appError(503, error))
        return 
    }
})

router.get('/courses/:course_id', isAuth, isCoach, async(req, res, next) => {
    try {
        const { user } = req
        const { course_id } = req.params
        
        const result = await coachController.findCourse({user_id: user.id, course_id})

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

router.put('/courses/:course_id', isAuth, async(req, res, next) => {
    try {
        const { user } = req
        const { course_id } = req.params
        
        const result = await coachController.updateCourse({user_id: user.id, course_id, ...req.body})    
        
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


router.post('/:user_id', async(req, res, next) => {
    try {
        const { user_id } = req.params
        
        const result = await coachController.addCoach({ user_id, ...req.body })

        if(result.status !== 'success'){
            next(result)
            return
        }

        res.status(200).json(result)  
    } catch (error) {
        console.log(error)
        next(appError(503, error))
        return 
    }
})

router.get('/', isAuth, isCoach, async(req, res, next) => {
    try {
        const { user } = req
        
        const result = await coachController.getCoach(user.id)

        if(result.status !== 'success'){
            next(result)
            return
        }

        res.status(200).json(result)  
    } catch (error) {
        console.log(error)
        next(appError(503, error))
        return 
    }
})

router.put('/', isAuth, isCoach, async(req, res, next) => {
    try {
        const { user } = req
        
        const result = await coachController.updateCoach({ user_id: user.id, ...req.body })

        if(result.status !== 'success'){
            next(result)
            return
        }

        res.status(200).json(result)  
    } catch (error) {
        console.log(error)
        next(appError(503, error))
        return 
    }
})

router.get('/revenue', isAuth, isCoach, async(req, res, next) => {
    try {
        const { user } = req
        const { month } = req.query
        
        const result = await coachController.getRevenue({ user_id: user.id, month })

        if(result.status !== 'success'){
            next(result)
            return
        }

        res.status(200).json(result)  
    } catch (error) {
        console.log(error)
        next(appError(503, error))
        return 
    }
})


module.exports = router