const Auth = require('../../model/authModel');
const bcrypt = require('bcrypt');

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      name,
      age,
      businessName,
      email,
      password,
      pinCode,
      address,
      updatedBy
    } = req.body;

    const user = await Auth.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }
    if (name) user.name = name;
    if (age) user.age = age;
    if (businessName) user.businessName = businessName;
    if (email) user.email = email;
    if (pinCode) user.pinCode = pinCode;
    if (address) user.address = address;
    if (updatedBy) user.updatedBy = updatedBy;
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({
      status: true,
      message: 'User updated successfully',
      data: user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Server error during user update',
      error: error.message
    });
  }
};

module.exports = {
  updateUser
};
