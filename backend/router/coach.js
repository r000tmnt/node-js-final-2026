const express = require('express')
const appError = require('../utils/appError')
const isCoach = require('../middleware/isCoach')
const { dataSource } = require('../db/data-source')
const { isValidString } = require('../utils/validator')
// const isAuth = require('../middleware/isAuth')
const coachController = require('../controllers/coachController')

const router = express.Router()

router.post('/:user_id', async(req, res, next) => {
// {
//   "experience_years": 3,
//   "description": "瑜伽與皮拉提斯雙修，擅長帶初學者",
//   "profile_image_url": "https://example.com/avatar.png"
// }
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

// router.get('/', isCoach, async(req, res, next) => {

// })

// router.put('/', isCoach, async(req, res, next) => {

// })

// router.get('/courses', isCoach, async(req, res, next) => {

// })

// router.post('/courses', isCoach, async(req, res, next) => {

// })

// router.get('/courses/:course_id', isCoach, async(req, res, next) => {

// })

// router.put('/courses/:course_id', isCoach, async(req, res, next) => {

// })

module.exports = router