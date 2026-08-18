const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Coach',
    tableName: 'COACH',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
        },
        user_id: {
            type: 'uuid',
            nullable: false,
            unique: true,
        },
        experience_years: {
            type: 'int',
            nullable: false,
            default: 0,
        },
        description: {
            type: 'text',
            nullable: true,
        },
        profile_image_url: {
            type: 'varchar',
            length: 2048,
            nullable: true,
        },
        skill_ids: {
            type: 'uuid',
            array: true,
            nullable: true,
            default: []
        },
        created_at: {
            type: 'timestamp',
            createDate: true,
        },
        updated_at: {
            type: 'timestamp',
            updateDate: true,
        }
    },
    relations: {
        user: {
            target: 'User',
            type: 'one-to-one',
            joinColumn: { name: 'user_id' },
        }
    }
})