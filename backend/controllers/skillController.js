const { dataSource } = require("../db/data-source")
const { isValidString } = require('../utils/validator');
const appError = require('../utils/appError');

const skillController = {
    getSkills: async() => {
        const skills = await dataSource.getRepository('Skill').find({
            select: { id: true, name: true }
        })
        return {
            status: 'success',
            data: skills
        }
    },

    addSkill: async(name) => {
        if(!isValidString(name)){
            return appError(400, '欄位未填寫正確')
        }

        // If repeated
        const skills = dataSource.getRepository('Skill')
        const sameSkill = await skills.findOneBy({ name: name.trim() })

        if(sameSkill){
            return appError(409, '資料重複')
        }

        const newSkill = await skills.save({ name: name.trim() })
        return {
            status: 'success',
            data: newSkill
        }
    },

    deleteSkill: async(skill_id) => {
        const result = await dataSource.getRepository('Skill').delete(skill_id)

        if(result.affected === 0){
            return appError(400, 'ID錯誤')
        }

        return {
            status: 'success',
            data: result
        }
    }
}

module.exports = skillController