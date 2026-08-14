const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
    name: 'CreditPackage',
    tableName: 'CREDIT_PACKAGE',
    columns: {
        id: {
            type: 'uuid',
            primary: true,
            generated: 'uuid'
        },
        name: {
            type: 'varchar',
            length: 50,
            nullable: false
        },
        credit_amount: {
            type: 'int',
            nullable: false
        },
        price: {
            type: 'int',
            nullable: false
        },
        created_at: {
            type: 'timestamp',
            createDate: true,
        },
        updated_at: {
            type: 'timestamp',
            updateDate: true,
        }        
    }
})