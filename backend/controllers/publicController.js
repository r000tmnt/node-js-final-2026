const { dataSource } = require("../db/data-source")
const appError = require("../utils/appError")
const { isValidString } = require("../utils/validator")

const publicController = {
    getCoaches: async({ per, page }) => {
        if(!per || !page ||
            typeof per !== 'number' ||
            typeof page !== 'number'
        ){
            return appError(400, '欄位未填寫正確')
        }

        const result = await dataSource.getRepository('Coach').
        findAndCount({
            skip: (page - 1) * per,
            take: per
        }) 

        const returnData = []

        for(let i=0; i < result[0].length; i++){
            const coach = result[0][i]
            const user = await dataSource.getRepository('User').findOneBy({ id: coach.user_id })

            returnData.push({
                id: coach.id,
                user_id: coach.user_id,
                name: user.name
            })
        }

        // console.log('returnData', returnData)

        return {
            status: 'success',
            data: returnData
        }
    },
    
    getCoach: async(coach_id) => {
        if(!isValidString(coach_id)){
            return appError(400, '欄位未填寫正確')
        }

        const coach = await dataSource.getRepository('Coach').findOneBy({ 
            id: coach_id
         })

        if(!coach){
            return appError(400, '找不到該教練')
        }

        coach['skills'] = []

        const skills = dataSource.getRepository('Skill')

        for(let i=0; i < coach.skill_ids.length; i++){
            const skill = await skills.findOneBy({ id: coach.skill_ids[i] })
            coach['skills'].push(skill.name)
        }

        delete coach.skill_ids

        return {
            status: 'success',
            data: coach
        }
    },

    getCoachCourses: async(coach_id) => {
        if(!isValidString(coach_id)){
            return appError(400, '欄位未填寫正確')
        }

        const coach = await dataSource.getRepository('Coach').findOneBy({ id: coach_id })

        if(!coach){
            return appError(400, '找不到該教練')
        }

        const now = Date.now()

        const courses = await dataSource.getRepository('Course').
        createQueryBuilder('course').
        where('course.end_at > :now', { now: new Date(now).toISOString() }).
        andWhere('course.user_id = :user_id', { user_id: coach.user_id }).
        getMany()

        courses.forEach(async(course) => {
            course['coach_name'] = coach.name
            const skill = await dataSource.getRepository('Skill').findOneBy({ id: course.skill_id })
            if(skill) course['skill_name'] = skill.name
        });

        return {
            status: 'success',
            data: courses
        }
    },

    getAllCourses: async() => {
        const now = Date.now()

        const courses = await dataSource.getRepository('Course').
        createQueryBuilder('course').
        where('course.end_at > :now', { now: new Date(now).toISOString() }).
        andWhere('course.start_at <= :now', { now: new Date(now).toISOString() }).
        getMany()

        courses.forEach(async(course) => {
            course['coach_name'] = coach.name
            const skill = await dataSource.getRepository('Skill').findOneBy({ id: course.skill_id })
            if(skill) course['skill_name'] = skill.name
        });

        return {
            status: 'success',
            data: courses
        }        
    }
}

module.exports = publicController