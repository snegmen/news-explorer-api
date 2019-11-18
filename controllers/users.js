const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');

// eslint-disable-next-line consistent-return
module.exports.createUser = (req, res, next) => {
  if (Object.keys(req.body).length === 0) return res.status(400).send({ message: 'Тело запроса пустое' });
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, email, password: hash,
    })
      .then((user) => res.status(201).send({
        _id: user._id, name: user.name, email: user.email,
      }))
      .catch(() => {
        const err = new Error('Ошибка создания пользователя');
        err.statusCode = 400;
        next(err);
      }));
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, process.env.NODE_ENV === 'production' ? process.env.JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.status(201).cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      }).send({ message: 'Ок' });
    })
    .catch((e) => {
      const err = new Error(e.message);
      err.statusCode = 401;
      next(err);
    });
};

module.exports.getSingleUser = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) throw Error;
      res.send({ user: user.name, email: user.email });
    })
    .catch(() => next(new NotFoundError('Такого пользователя не существует')));
};
