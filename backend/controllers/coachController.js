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
            experience_years <= 0 || 
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
    }
}

module.exports = coachController