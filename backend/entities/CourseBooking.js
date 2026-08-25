const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
    name: 'CourseBooking',
    tableName: 'COURSE_BOOKING',
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
        course_id: {
            type: 'uuid',
            unique: false,
            nullable: false
        },
        created_at: {
            type: 'timestamp',
            createDate: true
        },
        cancelled_at: {
            type: 'timestamp',
            nullable: true
        }     
    },
    relations: {
        user: {
            target: 'User',
            type: 'many-to-one',
            joinColumn: { name: 'user_id' }
        },
        course: {
            target: 'Course',
            type: 'many-to-one',
            joinColumn: { name: 'course_id' }
        },        
    }
})