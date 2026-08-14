const express = require('express');
const appError = require('../utils/appError')
const skillController = require('../controllers/skillController');

const router = express.Router();

router.get('/', async(req, res, next) => {
    try {
        const result = await skillController.getSkills()
        res.status(200).json(result)   
    } catch (error) {
        next(appError(503, error))
    }
});

router.post('/', async(req, res, next) => {
    try {
        const { name } = req.body
        const result = await skillController.addSkill(name)

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
        const result = await skillController.deleteSkill(id)

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