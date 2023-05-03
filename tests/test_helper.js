const Note = require('../models/note')
const User = require('../models/user')

const initialNote = [
    {
        content: 'HTML is easy',
        important: true
    },
    {
        content: 'Browser can execute only JavaScript',
        important: true
    }
]
const nonExistingId = async () => {
    const note = new Note({content: 'willremovethissoon'})
    await note.save()
    await note.deleteOne()
    return note.id.toString()
}
const notesInDb = async () => {
    const notes = await Note.find({})
    return notes.map(note => note.toJSON())
}

const userInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}
module.exports = {
    initialNote,
    nonExistingId,
    notesInDb,
    userInDb
}