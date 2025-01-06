const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT;
const routes = require('./routes/index');

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = 'mongodb+srv://user123:mongodb123@ac-utkzi0k.hlxuyz8.mongodb.net/rhythm-sense?retryWrites=true&w=majority';

async function connectToDb(){
  try{
      await mongoose.connect(dbURI, { useNewUrlParser: true });
      console.log('Connected to MongoDB Atlas');
  } catch(error){
      console.log('An error occurred: ', error);
  }
}

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    connectToDb();
})

app.use(routes);