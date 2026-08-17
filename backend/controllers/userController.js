const appError = require('../utils/appError')
const { dataSource } = require('../db/data-source')
const { isValidString, isValidPassword } = require('../utils/validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userController = {
    signUp: async(payload) => {
        let stringChecked = true

        for(const param in payload){
            if(!isValidString(param)){
                stringChecked = false
                break
            }
        }

        if(!stringChecked){
            return appError(400, '欄位未填寫正確')
        }

        if(!isValidPassword(payload.password)){
            return appError(400, '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
        }

        const savedEmail = payload.email.trim().toLowerCase()

        // Check email
        const users = dataSource.getRepository('User')
        const sameUser = await users.findOneBy({
            email: savedEmail
        })

        if(sameUser){
            return appError(409, 'Email 已被使用')
        }

        const hashed = await bcrypt.hash(payload.password, 10)

        const newUser = await users.save({ 
            name: payload.name,
            email: savedEmail,
            password: hashed
        })

        return {
            status: 'success',
            data: {
                user: {
                    id: newUser.id,
                    name: newUser.name
                }
            }
        }
    },

    login: async(payload) => {
        let stringChecked = true

        for(const param in payload){
            if(!isValidString(param)){
                stringChecked = false
                break
            }
        }

        if(!stringChecked || !isValidPassword(payload.password)){
            return appError(400, '欄位未填寫正確')
        }

        const savedEmail = payload.email.trim().toLowerCase()     
        
        const users = dataSource.getRepository('User')
        const sameUser = await users.findOneBy( {
            email: savedEmail,
        })

        
        if(!sameUser){
            return appError(400, '使用者不存在或密碼輸入錯誤')
        }  

        const isMatched = await bcrypt.compare(payload.password, sameUser.password)

        if(isMatched){
            const token = await jwt.sign({
                    id: sameUser.id,
                    role: sameUser.role,
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.JWT_EXPIRES_DAY
                }
            )

            return {
                status: 'success',
                data: {
                    token,
                    user: {
                        name: sameUser.name
                    }
                }
            }
        }else{
            return appError(400, '使用者不存在或密碼輸入錯誤')
        }
    },

    getUser: async(user_id) => {},
    
    updateUser: async(payload) => {},

    changePwd: async(payload) => {}
}

module.exports = userController