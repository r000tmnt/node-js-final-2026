const appError = require('../utils/appError')
const { dataSource } = require('../db/data-source')
const { isValidString } = require('../utils/validator')

const bookingController = {
    booking: async({ user_id, course_id }) => {
        const course = await dataSource.getRepository('Course').findOneBy({ id: course_id })

        if(!course){
            return appError(400, 'ID錯誤')
        }

        const courseBooking = await dataSource.getRepository('CourseBooking')
        
        const booked = await courseBooking.findOneBy({ user_id, course_id })

        if(booked){
            return appError(400, '已經報名過此課程')
        }

        const purchasedAll = await dataSource.getRepository('CreditPurchased').find({ 
            where: { user_id },
            relations: {
                creditPackage: true
            } 
        })

        const totalCredits = purchasedAll.reduce((pre, cur) => {
            pre + cur.creditPackage.credit_amount
        }, 0)

        const bookedAll = await courseBooking.findBy({ course_id })

        if((totalCredits - bookedAll.filter(b => !b.cancelled_at).length) <= 0){
            return appError(400, '已無可使用堂數')
        }

        if(bookedAll.length === course.max_participants){
            return appError(400, '已達最大參加人數，無法參加')
        }

        const result = await courseBooking.save({
            user_id,
            course_id
        })

        return {
            status: 'success',
            data: null
        }
    }
}

module.exports = bookingController