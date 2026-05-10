exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          error: "Forbidden: insufficient permissions",
        });
      }

      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Authorization failed" });
    }
  };
};