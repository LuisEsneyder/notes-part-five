const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Note = require('../models/note')

const api = supertest(app)
beforeEach(async () => {
    await Note.deleteMany({})
    let noteObject = new Note(helper.initialNote[0])
    await noteObject.save()
    noteObject = new Note(helper.initialNote[1])
    await noteObject.save()
})

test('a valid note can be added', async () => {
    const newNote = {
        content: 'async/await simplifies making async calls',
        important: true
    }
    await api.post('/api/notes').send(newNote).expect(201).expect('Content-Type', /application\/json/)
    
    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(helper.initialNote.length + 1) 
    const contents = notesAtEnd.map(n => n.content)
    expect(contents).toContain('async/await simplifies making async calls')
},200000)

test('note without content is not added', async () => {
    const newNote = {
        important: true
    }
    await api.post('/api/notes').send(newNote).expect(400)
    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(helper.initialNote.length)
},200000)

afterAll(async () => {
    await mongoose.connection.close()
})