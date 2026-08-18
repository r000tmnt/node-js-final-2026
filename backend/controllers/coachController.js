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
            !profile_image_url.includes('https://')
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
}

module.exports = coachController