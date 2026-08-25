const appError = require('../utils/appError')
const { dataSource } = require('../db/data-source')
const { isValidString } = require('../utils/validator')

const coachController = {
    addCoach: async(payload) => {
        const {
            user_id, 
            experience_years, 
            description, 
            profile_image_url
        } = payload

        // Update user role
        const users = dataSource.getRepository('User')
        const theUser = await users.findOneBy({ id: user_id })

        if(!theUser){
            return appError(400, '使用者不存在')
        }

        if(theUser.role === 'COACH'){
            return appError(409, '使用者已經是教練')
        }

        // check payload properties
        if(
            !isValidString(description) || 
            experience_years <= 0
        ){
            return appError(400, '欄位未填寫正確')
        }

        if(profile_image_url !== undefined && 
           profile_image_url.length && 
           !profile_image_url.startsWith('https://')
        ){
            return appError(400, '欄位未填寫正確')
        }

        const updateUser = await users.update(
            { id: user_id },
            { role: 'COACH' }
        )

        if(updateUser.affected === 0){
            return appError(400, '未更新使用者角色')
        }

        // Insert coach data
        const result = await dataSource.getRepository('Coach').save({
            user_id,
            experience_years,
            description,
            profile_image_url
        })

        return {
            status: 'success',
            data: {
                user: {
                    name: theUser.name,
                    role: 'COACH'
                },
                coach: {
                    id: result.id,
                    user_id: result.user_id,
                    experience_years: result.experience_years,
                    description: result.description,
                    profile_image_url: result.profile_image_url,
                    created_at: result.created_at,
                    updated_at: result.updated_at
                }
            }
        }    
    },

    getCoach: async(user_id) => {
        console.log('user_id', user_id)
        const coach = await dataSource.getRepository('Coach').findOneBy({ user_id })

        return {
            status: 'success',
            data: {
                ...coach,
                skill_ids: coach.skill_ids?? []
            }
        }
    },

    updateCoach: async(payload) => {
        const {
            user_id, 
            experience_years, 
            description, 
            profile_image_url,
            skill_ids
        } = payload

        // check payload properties
        if(
            !isValidString(description) || 
            experience_years <= 0 || 
            !profile_image_url.includes('https://') ||
            !skill_ids.length
        ){
            return appError(400, '欄位未填寫正確')
        }        

        const skills = dataSource.getRepository('Skill')
        let skillChecked = true

        for(let i=0; i < skill_ids.length; i++){
            const skill = await skills.findOneBy({ id: skill_ids[i] })
            if(!skill){
                skillChecked = false                
                break
            }
        }

        if(!skillChecked){
            return appError(400, '欄位未填寫正確')
        }

        const coaches = dataSource.getRepository('Coach')
        const theCoach = await coaches.findOneBy({ user_id }) 
        
        const result = await coaches.update(
            { user_id },
            {
                experience_years, 
                description, 
                profile_image_url,
                skill_ids            
            }
        )

        // Get updated result
        const updated = await dataSource.getRepository('Coach').findOneBy({ user_id })

        return {
            status: 'success',
            data: updated
        }
    },

    getCourses: async(user_id) => {
        // const result = await dataSource.getRepository('Course').findBy({ user_id })

        const result = await dataSource.getRepository('Course').find({ 
            where: {
                user: { id: user_id }
            }
         })

        const now = Date.now()

        result.forEach(course => {
            const start = new Date(course.start_at).getMilliseconds()
            const end = new Date(course.end_at).getMilliseconds()

            if(now > end){
                course['status'] = '已結束'
            }

            if(now < end && now > start){
                course['status'] = '進行中'
            }

            if(now < start){
                course['status'] = '尚未開始'
            }
        })

        return {
            status: 'success',
            data: result
        }
    },

    addCourse: async(payload) => {
    //     {
    //     "skill_id": "1c8da31a-5fb2-4f2b-9d3e-6a7b8c9d0e1f",
    //     "name": "重訓基礎入門",
    //     "description": "從零開始的重訓課，教你正確使用器材與姿勢。",
    //     "start_at": "2026-08-20T10:00:00Z",
    //     "end_at": "2026-08-20T12:00:00Z",
    //     "max_participants": 10,
    //     "meeting_url": "https://meet.example.com/abc-defg-hij"
    //     }
        console.log('payload', payload)

        const mustHave = ['skill_id', 'name', 'description', 'start_at', 'end_at']

        let paramMissing = false

        if(!payload['meeting_url'].startsWith('https')){
            return appError(400, '欄位未填寫正確')
        }

        if(payload['max_participants'] <= 0){
            return appError(400, '欄位未填寫正確')
        }        

        for(let i=0; i < mustHave.length; i++){
            if(mustHave[i] in payload && 
               isValidString(payload[mustHave[i]])
            ){
                continue
            }else{
                paramMissing = true
                break;
            }
        }

        if(paramMissing){
            return appError(400, '欄位未填寫正確')
        }        

        const newCourse = await dataSource.getRepository('Course').save({
            ...payload
        })

        return {
            status: 'success',
            data: {
                course: newCourse
            }
        }
    },

    findCourse: async(payload) => {
        const { user_id, course_id } = payload

        const result = await dataSource.getRepository('Course').
        // findOne({
        //     where: {
        //         id: course_id,
        //         user_id,
        //     },
        //     relations: {
        //         skill: true
        //     },
        //     select: {
        //         skill: {
        //             name: true
        //         }                
        //     }
        // })
        createQueryBuilder('course').
        innerJoin('course.skill', 'skill').
        where('course.id = :course_id', { course_id }).
        andWhere('course.user_id = :user_id', { user_id }).
        select([
            'course.id AS id',
            'course.name AS name',
            'course.description AS description',
            'course.start_at AS start_at',
            'course.end_at AS end_at',
            'course.max_participants AS max_participants',
            'skill.name AS skill_name',
            'course.skill_id AS skill_id',
            'course.meeting_url AS meeting_url'
        ]).
        getRawOne();

        if(!result){
            return appError(400, '課程不存在')
        }

        return {
            status: 'success',
            data: result
        }
    },

    updateCourse: async(payload) => {
        const { user_id, course_id } = payload

        const courses = dataSource.getRepository('Course')

        const theCourse = await courses.findOneBy({ id: course_id, user_id })

        if(!theCourse){
            return appError(400, '課程不存在')
        }

    //    {
    //     "skill_id": "1c8da31a-5fb2-4f2b-9d3e-6a7b8c9d0e1f",
    //     "name": "重訓基礎入門（改版）",
    //     "description": "課綱更新：加入自由重量的安全教學。",
    //     "start_at": "2026-08-21T10:00:00Z",
    //     "end_at": "2026-08-21T12:00:00Z",
    //     "max_participants": 12,
    //     "meeting_url": "https://meet.example.com/abc-defg-hij"
    //     } 

        const mustHave = ['skill_id', 'name', 'description', 'start_at', 'end_at']

        let paramMissing = false    

        if(!payload['meeting_url'].startsWith('https')){
            return appError(400, '欄位未填寫正確')
        }

        if(payload['max_participants'] <= 0){
            return appError(400, '欄位未填寫正確')
        }             

        for(let i=0; i < mustHave.length; i++){
            if(mustHave[i] in payload && 
               isValidString(payload[mustHave[i]])
            ){
                continue
            }else{
                paramMissing = true
                break;
            }
        }

        if(paramMissing){
            return appError(400, '欄位未填寫正確')
        }        

        await courses.update({ id: course_id }, { 
            skill_id: payload.skill_id,
            name: payload.name,
            description: payload.description,
            start_at: payload.start_at,
            end_at: payload.end_at,
            max_participants: payload.max_participants,
            meeting_url: payload.meeting_url
         })

        // Get updated result
        const updated = await courses.findOneBy({ id: course_id })

        return {
            status: 'success',
            data: {
                course: updated
            }
        }        
    },

    getRevenue: async(payload) => {
        const { user_id, month } = payload

        // console.log(user_id)
        // console.log(month)

        if(!isValidString(month) || 
           typeof month === 'number' ||
           month.includes('-')
        ){
            return appError(400, '欄位未填寫正確')
        }

        const now = Date.now()

        const year = new Date(now).getFullYear()

        const mm = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

        let monthIndex = mm.findIndex(m => m === month) + 1

        //  january, february, march, april, may, june, july, august, september, october, november, december

        const bookingOfTheMonth = await dataSource.getRepository('CourseBooking').
        createQueryBuilder('cb').
        innerJoin('cb.course', 'course').
        where('course.user_id = :user_id', { user_id }).
        andWhere('EXTRACT(MONTH FROM cb.created_at) = :monthIndex', { monthIndex }).
        andWhere('EXTRACT(YEAR FROM cb.created_at) = :year', { year }).
        andWhere('cb.cancelled_at IS NULL').
        getMany()

        console.log('bookingOfTheMonth', bookingOfTheMonth)
        

        const packages = await dataSource.getRepository('CreditPackage').
        createQueryBuilder('cp').
        getMany()

        // console.log('packages', packages.length)

        const totalPrice = packages.reduce((pre, cur) => pre + cur.price, 0)
        const totalCredit = packages.reduce((pre, cur) => pre + cur.credit_amount, 0)

        console.log('totalPrice', totalPrice)
        console.log('totalCredit', totalCredit)

        const avgPrice = totalPrice / totalCredit

        // console.log('avgPrice', avgPrice)

        const revenue = Math.floor(bookingOfTheMonth.length * avgPrice)

        const participants = []

        for(let i=0; i < bookingOfTheMonth.length; i++){
            const user = bookingOfTheMonth[i].user_id
            if(participants.find(p => p === user)){
                continue
            }else{
                participants.push(user)
            }
        }

        console.log('revenue', revenue)
        console.log('participants', participants.length)
        console.log('course_count', bookingOfTheMonth.length)

        return {
            status: 'success',
            data: {
                total: {
                    revenue,
                    participants: participants.length,
                    course_count: bookingOfTheMonth.length
                }
            }
        }
    }
}

module.exports = coachController