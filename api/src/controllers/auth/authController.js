const Auth = require('../../model/authModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const JWT_SECRET = process.env.JWT_SECRET ;

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Auth.findOne({ email });
    if (!user ) return res.status(404).json({
      status: false,
       message: 'User not found'
       });
       if(user.status !== 'enable')
       {
        return res.status(404).json({
          status: false,
           message: 'Your account has been blocked. Please contact the administrator to reactivate your ID.'
           });
       }
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({
      status: false,
       message: 'Invalid credentials'
       });
    const payload = {
      id: user._id,
      email: user.email
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    user.token = token;
     await user.save();
    const { password: _, ...authData } = user.toObject();

    res.status(200).json({
      status: true,
      message: 'Login successful',
      token,
      data: authData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      status: false,
      message: 'Server error during login',
      error: error.message
     });
  }
};

module.exports = { login };
