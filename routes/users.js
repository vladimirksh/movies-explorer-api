const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { patchUser, getCurrentUser } = require('../controllers/users');

router.get('/me', getCurrentUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required().min(2).max(30),
  }),
}), patchUser);

module.exports = router;
