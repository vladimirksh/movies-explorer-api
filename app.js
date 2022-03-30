const express = require('express');

const helmet = require('helmet');

require('dotenv').config();

const mongoose = require('mongoose');

const cors = require('cors');

const { errors } = require('celebrate');

const { requestLogger, errorLogger } = require('./middlewares/logger');

const rateLimiter = require('./middlewares/limiters');

const app = express();

const errorHandler = require('./middlewares/error-handler');

const { PORT = 3000, DB_ADDRESS, NODE_ENV } = process.env;
const { MONGO_DB } = require('./utils/configuration');

app.use(express.json());// It parses incoming req with JSON payloads and is based on body-parser.

app.use(cors());

app.use(helmet());

app.use(rateLimiter);

async function main() {
  // подключаемся к серверу mongo
  await mongoose.connect(NODE_ENV === 'production' ? DB_ADDRESS : MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('conect to db');

  await app.listen(PORT);
  console.log(`Listen ${PORT} port`);
}

app.use(requestLogger); // подключаем логгер запросов

// роуты
app.use(require('./routes'));

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors()); // обработчик ошибок celebrate

app.use(errorHandler); // централизованный обработчик

main();
