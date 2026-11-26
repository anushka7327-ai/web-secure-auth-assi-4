const express = require('express');
const mongoose = require('mongoose');
const Note = require('../models/Note');
const appEvents = require('../events');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate); // every notes route is protected

const validId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id)
    ? next()
    : res.status(400).json({ message: 'Invalid note id' });

// POST /api/notes
router.post('/', async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ message: 'title and content are required' });

  const note = await Note.create({ title, content, owner: req.user.id });
  appEvents.emit('note:created', note);
  res.status(201).json(note);
});

// GET /api/notes  (only the logged-in user's notes)
router.get('/', async (req, res) => {
  res.json(await Note.find({ owner: req.user.id }));
});

// GET /api/notes/:id
router.get('/:id', validId, async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, owner: req.user.id });
  if (!note) return res.status(404).json({ message: 'Note not found' });
  res.json(note);
});

// PUT /api/notes/:id
router.put('/:id', validId, async (req, res) => {
  const { title, content } = req.body;
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    { title, content },
    { new: true, runValidators: true }
  );
  if (!note) return res.status(404).json({ message: 'Note not found' });
  res.json(note);
});

// DELETE /api/notes/:id
router.delete('/:id', validId, async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!note) return res.status(404).json({ message: 'Note not found' });
  appEvents.emit('note:deleted', note);
  res.json({ message: 'Note deleted' });
});

module.exports = router;
