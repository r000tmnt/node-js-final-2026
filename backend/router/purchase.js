const express = require('express')
const appError = require('../utils/appError')
const isAuth = require('../middleware/isAuth')
const purchaseController = require('../controllers/purchaseController')

const router = express.Router()

router.post('/:creditPackageId', isAuth, async(req, res, next) => {
    try {
        const { creditPackageId } = req.params

        const result = await purchaseController.purchase({ user_id: req.user.id, credit_package_id: creditPackageId })
     
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

module.exports = router