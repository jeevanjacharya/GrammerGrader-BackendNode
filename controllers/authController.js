const User = require("../models/User");
const jwt = require('jsonwebtoken');

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  // incorrect email
  if (err.message === 'incorrect email') {
    errors.email = 'That email is not registered';
  }

  // incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'That password is incorrect';
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}

// create json web token
const createToken = (id) => {
  return jwt.sign({ id }, 'Grammer Backend',);
};


module.exports.signup_post = async (req, res) => {
  const { firstName,lastName,email, password } = req.body;
  try {
    const user = await User.create({ firstName,lastName,email, password });
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true });
    res.status(201).json({ signup: true });
  }
  catch (err) {
    console.log(err)
    res.status(201).json({ signup: false });
  }
}

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true });
    res.status(201).json({ login: true });
  }
  catch (err) {
    const errors = handleErrors(err);
    res.status(201).json({ login: false });
  }

}

module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/')
}