const jwt = require('jsonwebtoken')
const { dataSource } = require('../db/data-source')
const appError = require('../utils/appError')

const isAuth = async(req, res, next) => {
    try {
        const auth = req.headers.authorization

        if(!auth || !auth.startsWith('Bearer ')){
            return next(appError(401, '請先登入'))
        }

        const token = auth.split('Bearer ')[1]

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const users = dataSource.getRepository('User')

        const theUser = await users.findOneBy({
            id: decoded.id
        })

        if(!theUser){
            return next(appError(401, '無效的 token'))
        }

        req.user = theUser
        next()
    } catch (error) {
        if(error.name === 'TokenExpiredError'){
            return next(appError(401, "Token 已過期"))
        }
        return next(appError(401, '無效的 token'))
    }
}

module.exports = isAuth