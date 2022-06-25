const router = require('express').Router();
const Users = require('../user/user-model')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../middleware/secret');
const bcrypt = require('bcryptjs')

const {checkExists, checkInput, checkUnique} = require('./auth-middleware')

router.post('/register', checkInput, checkUnique, async (req, res, next) => {
  const {username, password} = req.body
  const hash = bcrypt.hashSync(password, 8)
  const user = {username, password: hash}
  const newUser = await Users.add(user)
  try {
    res.status(201).json(newUser)
  } catch (err) {
    next(err)
  }
})

router.post('/login', checkInput, checkExists, (req, res, next) => {
  const user = req.user
  const {password} = req.body
  const valid = bcrypt.compareSync(password, user.password)

  const generateToken = user => {
    const payload = {
      subject: user.id,
      username: user.username
    }
    const options = {
      expiresIn: '1d'
    }
    return jwt.sign(payload, JWT_SECRET, options)
  }
  if(valid) {
    res.status(200).json({message: `Welcome ${user.username}`, token: generateToken(user)})
  } else {
    next({status: 401, message: 'Invalid Credentials'})
  }
})

module.exports = router;
