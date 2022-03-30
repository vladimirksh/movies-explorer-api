const router = require('express').Router();
const { NotFoundError } = require('../errors');
const auth = require('../middlewares/auth');
const { PAGE_NON_FOUND } = require('../utils/constants');
// роут, не требующие авторизации
router.use(require('./auth'));

// авторизация
router.use(auth);

// роуты, которым авторизация нужна
router.use(require('./users'));
router.use(require('./movies'));

router.use((req, res, next) => {
  next(new NotFoundError(PAGE_NON_FOUND));
});

module.exports = router;
