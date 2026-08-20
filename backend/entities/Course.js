const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
    name: 'Course',
    tableName: 'COURSE',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
        },
        name: {
            type: 'varchar',
            length: 50,
            nullable: false,
        },
        start_at: {
            type: 'timestamp',
            nullable: false
        },
        end_at: {
            type: 'timestamp',
            nullable: false
        },
        max_participants: {
            type: 'int',
            nullable: false
        },
        meeting_url: {
            type: 'varchar',
            length: 100,
            nullable: true
        },
        participants: {
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
    },
    relations: {
        user: {
            target: 'User',
            type: 'one-to-one',
            joinColumn: { name: 'user_id' },
            nullable: false
        },
        skill: {
            target: 'Skill',
            type: 'one-to-one',
            joinColumn: { name: 'skill_id' },
            nullable: false
        }
    }
})