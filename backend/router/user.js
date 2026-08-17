const express = require('express');
const appError = require('../utils/appError')
const userController = require('../controllers/userController');
const isAuth = require('../middleware/isAuth')

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

router.get('/profile', isAuth, async(req, res, next) => {
    try {
        const { user } = req
        const result = await userController.getUser(user)

        if(result.status !== 'success'){
            next(result)
            return   
        }

        res.status(200).json(result) 
    } catch (error) {
        next(appError(503, error))
    }
})

router.put('/profile', isAuth, async(req, res, next) => {
    try {
        const { name } = req.body
        const result = await userController.updateUser({ user: req.user, name })

        if(result.status !== 'success'){
            next(result)
            return   
        }

        res.status(200).json(result)         
    } catch (error) {
        console.log(error)
        next(appError(400, '更新使用者資料失敗'))   
    }
})

router.put('/password', isAuth, async(req, res, next) => {
    try {
        const { password, new_password, confirm_new_password } = req.body
                const result = await userController.changePwd({ 
                    user: req.user, 
                    password, 
                    new_password, confirm_new_password 
                })

        if(result.status !== 'success'){
            next(result)
            return   
        }

        res.status(200).json(result)            
    } catch (error) {
        console.log(error)
        next(appError(400, '更新使用者資料失敗'))   
    }
})

module.exports = router