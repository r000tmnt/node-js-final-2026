const express = require('express');
const appError = require('../utils/appError')
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', async(req, res, next) => {
    try {
        const result = await userController.signUp(req.body)

        if(result.status !== 'success'){
            next(result)
            return   
        }

        res.status(201).json(result)   
    } catch (error) {
        next(appError(503, error))
    }
});

router.post('/login', async(req, res, next) => {
    try {
        const result = await userController.login(req.body)

        if(result.status !== 'success'){
            next(result)
            return   
        }

        res.status(200).json(result) 
    } catch (error) {
        next(appError(503, error))
    }
})

router.get('/profile', async(req, res, next) => {
    try {
        // const { id } = req.params
        // const result = await skillController.deleteSkill(id)

        // if(result.status !== 'success'){
        //     next(result)
        //     return   
        // }

        // res.status(200).json(result) 
    } catch (error) {
        next(appError(503, error))
    }
})

router.put('/profile', async(req, res, next) => {})

router.put('/password', async(req, res, next) => {})

module.exports = router