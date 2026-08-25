const { dataSource } = require('../db/data-source')
const appError = require('../utils/appError')

const purchaseController = {
    purchase: async({ user_id, credit_package_id }) => {
        const package = await dataSource.getRepository('CreditPackage').findOneBy({ id: credit_package_id })

        if(!package){
            return appError(400, 'ID錯誤')
        }

        const result = await dataSource.getRepository('CreditPurchased').save({
            user_id,
            credit_package_id,
            purchased_credits: package.credit_amount,
            price_paid: package.price
        })

        return {
            status: 'success',
            data: null
        }
    }
}

module.exports = purchaseController