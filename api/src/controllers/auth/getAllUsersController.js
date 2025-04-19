const Auth = require('../../model/authModel');

const getAllUsers = async (req, res) => {
  try {
    const users = await Auth.find().select('-password'); 
    res.status(200).json({
      status: true,
      message: 'Users fetched successfully',
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers
};
