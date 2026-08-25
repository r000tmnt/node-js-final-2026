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

        if(!stringChecked || !payload.email){
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

    getUser: async(user) => {
        if(!user){
            return appError(401, "無效的 token")
        }

        return {
            status: 'success',
            data: {
                user: {
                    name: user.name,
                    email: user.email
                }
            }
        }
    },
    
    updateUser: async(payload) => {
        if(!payload.name || !payload.name.length){
            return appError(400, '欄位未填寫正確')
        }
        
        if(payload.user.name === payload.name){
            return appError(400, '使用者名稱未變更')
        }

        const result = await dataSource.getRepository('User').update(
            { id: payload.user.id }, { name: payload.name }
        )

        return {
            status: 'success',
            data: {
                user: {
                    name: payload.name
                }
            }
        }
    },

    changePwd: async(payload) => {
        // console.log(payload)
        let stringChecked = true
        let pwdChecked = true

        const { user, password, new_password, confirm_new_password } = payload

        for(let i=0, s=[password, new_password, confirm_new_password]; i < s.length; i++){
            console.log('loop', s[i])
            if(!isValidString(s[i])){
                // console.log('isValidString param', param)
                stringChecked = false
                break
            }

            if(!isValidPassword(s[i])){
                // console.log('isValidPassword param', param)
                pwdChecked = false
                break
            }
        }

        if(!stringChecked){
            return appError(400, '欄位未填寫正確')
        }

        if(!pwdChecked){
            return appError(400, '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
        }

        if(password === new_password){
            return appError(400, '新密碼不能與舊密碼相同')
        }

        if(new_password !== confirm_new_password){
            return appError(400, '新密碼與驗證新密碼不一致')
        }

        const users = dataSource.getRepository('User')
        const theUser = await users.findOneBy({ id: user.id })
        const isMatched = await bcrypt.compare(password, theUser.password)

        if(!isMatched){
            return appError(400, '密碼輸入錯誤')
        }

        const newHash = await bcrypt.hash(new_password, 10)

        const result = await users.update({ id: user.id }, { password: newHash })

        return {
            status: 'success',
            data: null
        }
    },

    getCreditPackage: async(user_id) => {
        const packages = await dataSource.getRepository('CreditPurchased').
        createQueryBuilder('cp').
        innerJoin('cp.creditPackage', 'creditPackage').
        where('cp.user_id = :user_id', { user_id }).
        select([
            'creditPackage.name AS name',
            'creditPackage.credit_amount AS purchase_credits',
            'cp.price_paid AS price_paid',
            'cp.purchase_at AS purchase_at'
        ]).
        getRawMany()

        return {
            status: 'success',
            data: packages
        }
    },

    getCourses: async(user_id) => {
        const total = await dataSource.getRepository('CreditPurchased').
        createQueryBuilder('cp').
        innerJoin('cp.creditPackage', 'creditPackage').
        where('cp.user_id = :user_id', { user_id }).
        select([
            'creditPackage.credit_amount AS credit_amount'
        ]).
        getRawMany()

        console.log('total', total)

        const totalCredit = total.reduce((pre, cur) => {
            pre + cur.credit_amount
        }, 0)

        const course_booking = await dataSource.getRepository('CourseBooking').
        createQueryBuilder('cb').
        innerJoin('cb.course', 'course').
        innerJoin('course.user', 'user').
        where('cb.user_id = :user_id', { user_id }).
        select([
            'course.id AS course_id',
            'course.name AS name',
            'course.start_at AS start_at',
            'course.end_at AS end_at',
            'course.meeting_url AS meeting_url',
            'user.name AS coach_name',
            'cb.cancelled_at AS cancelled_at'
        ]).
        getRawMany()

        const credit_usage = course_booking.filter(cb => !cb.cancelled_at).length

        const credit_remain = totalCredit - credit_usage

        return {
            status: 'success',
            credit_remain,
            credit_usage,
            course_booking
        }
    }
}

module.exports = userController