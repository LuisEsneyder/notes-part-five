const mongoose = require('mongoose')

const noteSchema = mongoose.Schema({
    content: {
        type: String,
        minLength: 5,
        required: true
    },
    important: Boolean,
    users: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

noteSchema.set('toJSON',(document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
})

module.exports = mongoose.model('Note', noteSchema)