const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('notes',{content: 1, important: 1})
    response.status(200).json(users)
})

usersRouter.post('/', async (request, response) => {
    const {username, name, password} = request.body
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const newUser = new User({
        username,
        name,
        passwordHash
    })
    const saveUser = await newUser.save()

    response.status(201).json(saveUser)

})

module.exports = usersRouter