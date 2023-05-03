const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const Note = require('../models/note')
const api = supertest(app)
const bcrypt = require('bcrypt')
const User = require('../models/user')
beforeEach(async () => {
    await Note.deleteMany({})
    const noteObjects = helper.initialNote.map(note => new Note(note))
    const promiseArray = noteObjects.map(note => note.save())
    await Promise.all(promiseArray)
})
describe('when there is initially some notes saved', () => {
    test('notes are returned as json', async () => {
        await api.get('/api/notes').expect(200).expect('Content-Type', /application\/json/)
    })
    test('all notes are returned', async () => {
        const response = await api.get('/api/notes')
        
        expect(response.body).toHaveLength(helper.initialNote.length)
    },100000)
    test('a specific note is within the returned notes', async () => {
        const response = await api.get('/api/notes')
        const contents = response.body.map(r => r.content)
        expect(contents).toContain('Browser can execute only JavaScript')
    },100000)
})

describe('viewing a specific note', () => {
    test('a specific note can be viewed', async () => {
        const noteAtStart = await helper.notesInDb()
        const noteAtStartJsonc = noteAtStart.map(note => {
            return {...note, _id : note._id.toJSON()}
        })
        const noteToView =noteAtStartJsonc[0]
        const resultNote = await api.get(`/api/notes/${noteToView._id}`).expect(200).expect('Content-Type',/application\/json/)
        expect(resultNote.body).toEqual(noteToView)
    },200000 )
})
describe('addition of a new note',() => {
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
    test('fails with status code 400 if data invalid', async () => {
        const newNote = {
            important: true
        }
        await api.post('/api/notes').send(newNote).expect(400)
        const notesAtEnd = await helper.notesInDb()
        expect(notesAtEnd).toHaveLength(helper.initialNote.length)
    },200000)
})
describe('deletion of a note', () => {
    test('a note can be delete', async () => {
        const noteAtStart = await helper.notesInDb()
        const noteAtStartJSON = noteAtStart.map(note => {
            return {...note, _id : note._id.toJSON()}
        })
        const notetoDelete = noteAtStartJSON[0]
    
        await api.delete(`/api/notes/${notetoDelete._id}`).expect(204)
    
        const noteAtEnd = await helper.notesInDb()
    
        expect(noteAtEnd).toHaveLength(noteAtStart.length - 1)
    
        const contents = noteAtEnd.map(r => r.content)
        expect(contents).not.toContain(notetoDelete.content)
    },200000)
})

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        const password= await bcrypt.hash('sekret', 10)
        const user = new User({username: 'root', password})
        await user.save() 
    })
    test('creation succeeds with a fresh username', async () => {
        const userAtStart = await helper.userInDb()
        const newUser = {
            username: "mluukai",
            name: "matti luukkainen",
            password: "salainen"
        }
        await api.post('/api/users').send(newUser).expect(201).expect('Content-Type', /application\/json/)
        const userAtEnd = await helper.userInDb()
        expect(userAtEnd).toHaveLength(userAtStart.length + 1)
        const usernames = userAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    },200000)
    test('creation fails with proper statuscode and message if username already taken', async () => {
        const userAtStart = await helper.userInDb()
        const newUsers = {
            username: "root",
            name: "Superuser",
            password: "salainen"
        }
        const result =await api.post('/api/users').send(newUsers).expect(400)
        expect(result.body.error).toContain('expected `username` to be unique')
        const userAtEnd = await helper.userInDb()
        expect(userAtEnd).toEqual(userAtStart)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})
