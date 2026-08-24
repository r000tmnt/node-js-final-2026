const { dataSource } = require("../db/data-source")
const appError = require("../utils/appError")

const publicController = {
    getCoaches: async({ per, page }) => {
        if(!per || !page ||
            typeof per !== 'number' ||
            typeof page !== 'number'
        ){
            return appError(400, '欄位未填寫正確')
        }

        const result = await dataSource.getRepository('Course').
        findAndCount({
            skip: (page - 1) * per,
            take: per
        }) 

        return {
            status: 'success',
            data: result[0]
        }
    }
}

module.exports = publicController