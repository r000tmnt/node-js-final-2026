const express = require('express')
const appError = require('../utils/appError')
const isAuth = require('../middleware/isAuth')
const bookingController = require('../controllers/bookingController')

const router = express.Router()

router.post('/:courseId', isAuth, async(req, res, next) => {
    try {
        const { courseId } = req.params
        const result = await bookingController.booking({ user_id: req.user.id, course_id: courseId })

        if(result.status !== 'success'){
            next(result)
            return
        }

        res.status(201).json(result)  
    } catch (error) {
        console.log(error)
        next(appError(503, error))
        return 
    }
})

router.delete('/:courseId', isAuth, async(req, res, next) => {
    try {
        const { courseId } = req.params
        const result = await bookingController.cancel({ user_id: req.user.id, course_id: courseId })

        if(result.status !== 'success'){
            next(result)
            return
        }

        res.status(201).json(result)  
    } catch (error) {
        console.log(error)
        next(appError(503, error))
        return 
    }
})

module.exports = router