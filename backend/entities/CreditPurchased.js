const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
    name: 'CreditPurchased',
    tableName: 'CREDIT_PURCHASED',
    columns: {
        id: {
            type: 'uuid',
            primary: true,
            generated: 'uuid'
        },
        user_id: {
            type: 'uuid',
            unique: false,
            nullable: false
        },
        credit_package_id: {
            type: 'uuid',
            unique: false,
            nullable: false
        },
        price_paid: {
            type: 'int',
            nullable: false
        },   
        purchase_at: {
            type: 'timestamp',
            createDate: true
        }     
    },
    relations: {
        user: {
            target: 'User',
            type: 'many-to-one',
            joinColumn: { name: 'user_id' }
        },
        creditPackage: {
            target: 'CreditPackage',
            type: 'many-to-one',
            joinColumn: { name: 'credit_package_id' }
        },        
    }
})