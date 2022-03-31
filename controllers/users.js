const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { SECRET_KEY } = require('../utils/configuration');
const {
  INCORRECT_EMAIL_PASSWORD,
  EMAIL_ALREADY_USE,
  INCORRECT_DATA_CREATE,
  INCORRECT_DATA_PATCH,
  USER_NOT_FOUND,
} = require('../utils/constants');
const {
  NotValidateError,
  NotFoundError,
  NotDoubleError,
  NotAuthError,
} = require('../errors');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  // хешируем пароль
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email, password: hash, name,
    }))
    .then(() => {
      res.send({
        data: {
          name, email,
        },
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new NotDoubleError(EMAIL_ALREADY_USE));
      } else if (err.name === 'ValidationError') {
        next(new NotValidateError(INCORRECT_DATA_CREATE));
      } else {
        next(err);
      }
    });
};

module.exports.getCurrentUser = (req, res, next) => {
  const id = req.user._id;

  User.findById(id)
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      res.send(err);
    })
    .catch(next);
};

module.exports.patchUser = (req, res, next) => {
  const { email, name } = req.body;
  return User.findByIdAndUpdate(
    req.user._id,
    { email, name },
    // Передадим объект опций:
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
      upsert: false, // если пользователь не найден, он не будет создан
    },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError(USER_NOT_FOUND);
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new NotDoubleError(EMAIL_ALREADY_USE));
      } else if (err.name === 'ValidationError') {
        next(new NotValidateError(INCORRECT_DATA_PATCH));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создадим токен
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : SECRET_KEY, { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(() => {
      // ошибка аутентификации
      next(new NotAuthError(INCORRECT_EMAIL_PASSWORD));
    });
};
