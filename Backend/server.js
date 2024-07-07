require(`dotenv`).config()

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

mongoose.connect("mongodb+srv://Miltiadis:SHA25@cluster0.5konvqu.mongodb.net/chAIrlie")

const User = mongoose.model(`User`, {})

app.post('/chat', async (req, res) => {
    try {
      const { messages } = req.body;
      const chatCompletion = await openai.chat.completions.create({
        messages,
        model: 'gpt-3.5-turbo',
      });
      res.json(chatCompletion);
    } catch (error) {
      res.status(500).send('Error communicating with OpenAI API');
    }
  });

app.get(`/`, (req,res)=>{
    res.send(`Hello world`)
})

app.listen(port, ()=>{
    console.log(`server is running on port ${port}`)
    console.log(`Secret Key ${secretKey}`)

})