const Movie = require('../models/movie');
const {
  NotValidateError,
  NotOwnerError,
  NotFoundError,
} = require('../errors');

module.exports.getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => { res.send(movies); })
    .catch((err) => next(err));
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  const owner = req.user._id;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((movie) => {
      if (!movie) {
        throw new NotValidateError('Переданы некорректные данные');
      } else {
        res.send(movie);
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new NotValidateError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.filmId)
    .orFail(() => new NotFoundError('Передан несуществующий id фильма'))
    .then((movie) => {
      if (!movie.owner.equals(req.user._id)) {
        return next(new NotOwnerError('Попытка удалить чужой фильм'));
      }
      return movie.remove()
        .then(() => res.send({ message: 'Фильм удалён' }));
    })
    .catch(next);
};
