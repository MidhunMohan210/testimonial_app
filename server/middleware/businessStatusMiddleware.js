import Business from "../models/Business.js";

const SUSPENDED_MESSAGE =
  "Your Woice account has been suspended. Please contact Woice support for assistance.";

const businessStatusMiddleware = async (req, res, next) => {
  try {
    if (!req.user || req.user.role === "admin") {
      return next();
    }

    if (!req.user.businessId) {
      return next();
    }

    const business = await Business.findById(req.user.businessId)
      .select("accountStatus")
      .lean();

    if (business?.accountStatus === "suspended") {
      return res.status(403).json({
        code: "ACCOUNT_SUSPENDED",
        message: SUSPENDED_MESSAGE,
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export default businessStatusMiddleware;
