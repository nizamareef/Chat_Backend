var jwt = require('jsonwebtoken');
const dotenv=require('dotenv')
JWTSECRET=process.env.SECRET

const fetchdata = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).send({ msg: 'No auth token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWTSECRET);
    if (!decoded.userId) {   
      return res.status(401).send({ msg: 'Invalid auth token' });
    }

    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: 'Internal Server Error' });
  }
};

module.exports= fetchdata

