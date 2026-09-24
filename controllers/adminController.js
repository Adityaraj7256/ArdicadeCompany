const getAdminDashboard = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to ARDICADE Admin Dashboard",
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

module.exports = {
  getAdminDashboard,
};