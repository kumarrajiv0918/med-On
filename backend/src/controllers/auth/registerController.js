const Auth = require('../../model/authModel');

const register = async (req, res) => {
  try {
    const {
      name,
      businessName,
      email,
      password,
      roleId,
      pinCode,
      address,
      createdBy,
      status // added this
    } = req.body;

    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: 'Email already registered'
      });
    }

    const user = new Auth({
      name,
      businessName,
      email,
      password,
      roleId,
      pinCode,
      address,
      createdBy,
      status: status || 'enable' 
    });

    await user.save();

    res.status(201).json({
      status: true,
      message: 'User registered successfully',
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

module.exports = {
  register
};
