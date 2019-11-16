const users = require('express').Router();
const { getSingleUser } = require('../controllers/users');

users.get('/', getSingleUser);

users.get('/me', getSingleUser);

module.exports = users;
