const { dataSource } = require("../db/data-source")
const { isValidString, isInteger } = require('../utils/validator');
const appError = require('../utils/appError');

const creditPackageController = {
    getCreditPackages: async() => {
        const packages = await dataSource.getRepository('CreditPackage').find({
            select: { 
                id: true, 
                name: true,
                credit_amount: true,
                price: true 
            }
        })
        return {
            status: 'success',
            data: packages
        }
    },

    addCreditPackage: async(payload) => {
        if(!isValidString(payload.name)){
            return appError(400, '欄位未填寫正確')
        }

        if(!isInteger(payload.credit_amount)){
            return appError(400, '欄位未填寫正確')
        }

        if(!isInteger(payload.price)){
            return appError(400, '欄位未填寫正確')
        }

        // If repeated
        const packages = dataSource.getRepository('CreditPackage')
        const samePackage = await packages.findOneBy({ name: payload.name })

        if(samePackage){
            return appError(409, '資料重複')
        }

        const newPackage = await packages.save({ ...payload })
        return {
            status: 'success',
            data: newPackage
        }
    },

    deleteCreditPackage: async(creditPackage_id) => {
        const result = await dataSource.getRepository('CreditPackage').delete(creditPackage_id)

        if(result.affected === 0){
            return appError(400, 'ID錯誤')
        }

        return {
            status: 'success',
            data: result
        }
    }
}

module.exports = creditPackageController