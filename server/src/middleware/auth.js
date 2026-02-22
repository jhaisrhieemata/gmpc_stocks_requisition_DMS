/**
 * Authentication Middleware
 * Protects routes and validates session/JWT
 */

export const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  }

  if (req.session.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Admin access required" });
  }

  next();
};

export const requireUser = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  }

  if (req.session.user.role !== "user") {
    return res
      .status(403)
      .json({ success: false, message: "User access required" });
  }

  next();
};

export default {
  requireAuth,
  requireAdmin,
  requireUser,
};
