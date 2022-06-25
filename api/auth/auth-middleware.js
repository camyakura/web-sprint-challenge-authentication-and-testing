const Users = require('../user/user-model')

const checkUnique = async (req, res, next) =>{ // for signing up
    const {username} = req.body
    const result = await Users.getByUsername(username)

    if(result) {
        next({status: 401, message: 'Username Taken'})
    } else {
        next()
    }
}
const checkExists = async (req, res, next) => { // for logging in
    const {username} = req.body
    const result = await Users.getByUsername(username)

    if(result) {
       req.user = result
       next()
    } else {
        next({status: 401, message: 'Invalid Credentials'})
    }
}
const checkInput = (req, res, next) => {
    const {username, password} = req.body
    if(!username || !password) {
        next({status: 400, message: 'Username and password are required'})
    } else {
        next()
    }
}

module.exports = {
    checkUnique,
    checkExists,
    checkInput
}