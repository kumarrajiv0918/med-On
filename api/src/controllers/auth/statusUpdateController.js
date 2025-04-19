const Auth = require('../../model/authModel');

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, updatedBy } = req.body;

    if (!['enable', 'disable'].includes(status)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid status value. Use "enable" or "disable".'
      });
    }

    const user = await Auth.findByIdAndUpdate(
      id,
      {
        status,
        updatedBy: updatedBy || 'system'
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: true,
      message: `User status updated to "${status}" successfully`,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'Server error while updating status',
      error: error.message
    });
  }
};

module.exports = {
  updateUserStatus
};
