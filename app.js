const express = require('express');

const mongoose = require('mongoose');

const app = express();

const { PORT = 3000 } = process.env;

app.use(express.json());// It parses incoming req with JSON payloads and is based on body-parser.

async function main() {
  // подключаемся к серверу mongo
  await mongoose.connect('mongodb://localhost:27017/moviesdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('conect to db');

  await app.listen(PORT);
  console.log(`Listen ${PORT} port`);
}

app.get('/', (req, res) => {
  res.send('hello');
});

main();
