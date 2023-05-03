const notesRoutes = require("express").Router();
const Note = require("../models/note");
const User = require('../models/user')
const jwt = require('jsonwebtoken')

notesRoutes.get("/", async (request, response) => {
  const notes = await Note.find({}).populate('users', {username: 1, name: 1});
  response.json(notes);
});
notesRoutes.get("/:id", async (request, response) => {
  const note = await Note.findById(request.params.id);
  if (note) {
    response.json(note);
  }
});
//función para obtener el token
const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if(authorization && authorization.startsWith('bearer ')){
    return authorization.replace('bearer ', '')
  }
  return null
}
notesRoutes.post("/", async (request, response) => {
  const { content, important} = request.body;
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if(!decodedToken.id){
    return response.status(401).json({error: 'toked invalid'})
  }
  const user = await User.findById(decodedToken.id)
  const note = new Note({
    content,
    important: important || false,
    users: user.id
  });
  const saveNote = await note.save();
  user.notes = user.notes.concat(saveNote._id)
  await user.save()
  response.status(201).json(saveNote);
});
notesRoutes.delete("/:id", async (request, response) => {
  await Note.findByIdAndRemove(request.params.id);
  response.status(204).end();
});
notesRoutes.put("/:id", (request, response, next) => {
  const { content, important } = request.body;
  const note = {
    content,
    important,
  };
  Note.findByIdAndUpdate(request.params.id, note, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((result) => {
      response.json(result);
    })
    .catch((error) => next(error));
});
module.exports = notesRoutes;
