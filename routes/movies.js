const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { getMovies, createMovie, deleteMovie } = require('../controllers/movies');

router.get('/', getMovies);

router.post('/', createMovie);

router.delete('/:filmId', celebrate({
  params: Joi.object().keys({
    filmId: Joi.string().hex().length(24),
  }),
}), deleteMovie);

module.exports = router;
