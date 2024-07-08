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

mongoose.connect("mongodb+srv://Miltiadis:SHA25@cluster0.5konvqu.mongodb.net/chAIrlie", {
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});


const simpleSchema = new mongoose.Schema({
  date: {type: Date, default: Date.now},
  content:
    [{userText: String,
      PAtext: String,
    }]
});

const SimpleModel = mongoose.model('SimpleModel', simpleSchema);

app.post('/chat/new', async (req, res) => {
  try {
      const newDocument = await SimpleModel.create(req.body); // Create a new document directly
      res.status(201).json(newDocument);
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

app.get('/chat', async (req, res) => {
  try {
      const interactions = await SimpleModel.find();
      res.json(interactions);
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve documents' });
  }
});

app.get('/chat/:id', async (req, res) => {
  try {
      const interactions = await SimpleModel.find({ _id: req.params.id });
      res.json(interactions);
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve documents' });
  }
});

app.post('/chat/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const { messages } = req.body;
    console.log(`Received chat ID: ${id}`)
    console.log(`Messages1: ${JSON.stringify(messages)}`);
    console.log(`${messages[0].content}`)
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
    console.log(`${chatCompletion.choices[0].message.role}`)
    console.log(`${chatCompletion.choices[0].message.content}`)
  } catch (error) {
    res.status(500).send('Error communicating with OpenAI API');
  }
});

// app.post('/chat/:id', async (req, res) => {
//     try {
//       const {id} = req.params;
//       const { messages } = req.body;
//       console.log(`Received chat ID: ${id}`)
//       console.log(`Messages2: (messages)}`);
      
//       const chatCompletion = await openai.chat.completions.create({
//         messages,
//         model: 'gpt-3.5-turbo',
//       });
      
//       console.log(messages[0].content)
//       res.json(chatCompletion);
//       console.log(chatCompletion.choices[0].message.role)
//       console.log(chatCompletion.choices[0].message.content)

//     } catch (error) {
//       res.status(500).send('Error communicating with OpenAI API');
//     }
//   });

app.get(`/`, (req,res)=>{
    res.send(`Hello world`)
})

app.listen(port, ()=>{
    console.log(`server is running on port ${port}`)
    console.log(`Secret Key ${secretKey}`)

})