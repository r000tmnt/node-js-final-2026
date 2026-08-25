const express = require('express')
const appError = require('../utils/appError')
const isAuth = require('../middleware/isAuth')

const router = express.Router()

router.post('/:courseId', isAuth, async(req, res, next) => {

})

router.delete('/:courseId', isAuth, async(req, res, next) => {

})

module.exports = router