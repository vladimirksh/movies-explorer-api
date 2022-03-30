const jwt = require('jsonwebtoken');
const {
  NotAuthError,
} = require('../errors');
const { SECRET_KEY } = require('../utils/configuration');
const { AUTHORIZATION_REQUIRED } = require('../utils/constants');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
// достаём авторизационный заголовок
  const { authorization } = req.headers;

  // убеждаемся, что он есть или начинается с Bearer
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new NotAuthError(AUTHORIZATION_REQUIRED);
  }

  // извлечём токен
  const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    // попытаемся верифицировать токен
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : SECRET_KEY);
  } catch (err) {
    // отправим ошибку, если не получилось
    next(new NotAuthError(AUTHORIZATION_REQUIRED));
  }
  req.user = payload; // записываем пейлоуд в объект запроса
  next(); // пропускаем запрос дальше
};
