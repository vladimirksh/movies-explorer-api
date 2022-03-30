const Movie = require('../models/movie');
const {
  NotValidateError,
  NotOwnerError,
  NotFoundError,
} = require('../errors');
const {
  INCORRECT_DATA,
  NONEXISTENT_MOVIE_ID,
  DELETE_SOMEONE_MOVIE,
  DELETE_MOVIE,
} = require('../utils/constants');

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
        throw new NotValidateError(INCORRECT_DATA);
      } else {
        res.send(movie);
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new NotValidateError(INCORRECT_DATA));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.filmId)
    .orFail(() => new NotFoundError(NONEXISTENT_MOVIE_ID))
    .then((movie) => {
      if (!movie.owner.equals(req.user._id)) {
        return next(new NotOwnerError(DELETE_SOMEONE_MOVIE));
      }
      return movie.remove()
        .then(() => res.send({ message: DELETE_MOVIE }));
    })
    .catch(next);
};
