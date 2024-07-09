require('dotenv').config()

const express = require("express");
const app = express();
const cors = require("cors")
const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const OpenAI = require(`openai`)
const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'],
});

const port = process.env.PORT || 3002;
const secretKey = process.env.SECRET_KEY;


app.use(express.json());

app.use(cors({
    origin:"*"
}))

//Middleware

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  try {
    const verified = jwt.verify(token.split(' ')[1], secretKey);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

//Database connection
mongoose.connect("mongodb+srv://Miltiadis:SHA25@cluster0.5konvqu.mongodb.net/chAIrlie", {
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

//Chat Model Schema
const simpleSchema = new mongoose.Schema({
  userId: String,
  date: {type: Date, default: Date.now},
  content:
    [{userText: String,
      PAtext: String,
    }]
});
const SimpleModel = mongoose.model('SimpleModel', simpleSchema);

//Chat routes
app.post('/chat/new', authMiddleware, async (req, res) => {
  try {
      const userId = req.user.id; // Extracted user ID from the token
      const newChat = new SimpleModel({
          userId, // Associate the chat with the user ID
          content: [] // Initialize with empty content or any other default values
      });
      await newChat.save();
      res.status(201).json(newChat);
  } catch (error) {
      res.status(500).json({ error: 'Failed to create document' });
  }
});

app.delete('/chat/:id', async (req, res) => {
  try {
      const DBRes = await SimpleModel.deleteOne({ _id: req.params.id });
      if (DBRes.deletedCount === 0) {
          res.status(404).json({ error: 'Document not found' });
      } else {
          res.json(DBRes);
      }
  } catch (error) {
      res.status(500).json({ error: 'Failed to delete document' });
  }
});

app.get('/chat/admin', async (req, res) => {
  try {
      const chats = await SimpleModel.find(); // Find chats by user ID
      res.json(chats);
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve documents' });
  }
});

app.get('/chat', authMiddleware, async (req, res) => {
  try {
      const userId = req.user.id; // Extract user ID from the token
      const chats = await SimpleModel.find({ userId }); // Find chats by user ID
      res.json(chats);
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve documents' });
  }
});

app.get('/chat/:id', async (req, res) => {
  try {
      const  chat = await SimpleModel.find({ _id: req.params.id });
      res.json(chat);
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve documents' });
  }
});

app.post('/chat/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const { messages } = req.body;
    const chatCompletion = await openai.chat.completions.create({
      messages,
      model: 'gpt-3.5-turbo',
    });
    const userMessage = `${messages[0].content}`;
    const assistantMessage = `${chatCompletion.choices[0].message.content}`;
    const updatedDocument = await SimpleModel.findByIdAndUpdate(
      id,
      { $push: { content: { userText: userMessage, PAtext: assistantMessage } } },
      { new: true }
    );
    res.json(chatCompletion);
  } catch (error) {
    res.status(500).send('Error communicating with OpenAI API');
  }
});

app.get(`/`, (req,res)=>{
    res.send(`Hello world`)
})

// Authentication
// User Model Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema)
// Routes
// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ id: user._id }, secretKey);
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id }, secretKey);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Protected Route (example usage of authMiddleware)
app.get('/api/protected', authMiddleware, (req, res) => {
  res.send('This is a protected route');
});

app.listen(port, ()=>{
    console.log(`server is running on port ${port}`)
    console.log(`Secret Key ${secretKey}`)

})