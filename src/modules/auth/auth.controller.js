import { Router } from "express";
import * as service from "./auth.service.js";
import { response } from "../../utils/response.js";
import { verifyToken } from "../../middlewares/verifyToken.js";
import { checkRole } from "../../middlewares/checkRole.js";
import { ROLES } from "../../constants/roles.js";
import { loginSchema, logoutSchema, signupSchema } from "./auth.validation.js";
import { validation } from "../../middlewares/validation.middleware.js";

const router = Router();

router.post("/signup", validation(signupSchema), async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const data = await service.signupService({
    firstName,
    lastName,
    email,
    password,
  });
  return response({
    res,
    statusCode: 201,
    success: true,
    message: "user Created Successfully",
    data,
  });
});

router.post("/login", validation(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const data = await service.loginService({ email, password });

  return response({
    res,
    statusCode: 202,
    success: true,
    message: "Welcome Back Again",
    data,
  });
});

router.get(
  "/profile",
  verifyToken,
  checkRole(ROLES.ADMIN, ROLES.USER),
  async (req, res) => {
    return response({
      res,
      data: req.user,
      message: "get Profile Successfully",
    });
  },
);

router.post("/signup/gmail", async (req, res) => {
  const { idToken } = req.body;

  const data = await service.googleSignUp({ googleToken: idToken });
  return response({
    res,
    data,
    message: "Successfully Signup with Google",
  });
});

router.patch(
  "/logout",
  verifyToken,
  validation(logoutSchema),
  async (req, res) => {
    const { flag } = req.body;

    await service.logoutService({
      user: req.user,
      jti: req.decoded.jti,
      iat: req.decoded.iat,
      flag,
    });

    return response({
      res,
      message: "Logged out successfully",
      data: {},
    });
  },
);

router.get("/forget-password", verifyToken, async (req, res) => {
  await service.forgetPasswordService({ user: req.user });

  return response({
    res,
    message: "OTP sent successfully to your email",
    data: {},
  });
});

router.patch("/reset-password", verifyToken, async (req, res) => {
  const { password, newPassword, repeatPassword } = req.body;

  await service.resetPasswordService({
    user: req.user,
    password,
    newPassword,
    repeatPassword,
  });

  return response({
    res,
    message: "Password reset successfully",
    data: {},
  });
});

router.patch("/enable-two-factor-auth", verifyToken, async (req, res) => {
  const { isEnable } = req.body;
  await service.enableTwoFactorAuthService({ user: req.user, isEnable });

  return response({
    res,
    message: "Two Factor Authentication enabled successfully",
    data: {},
  });
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const data = await service.verifyOtpService({
    email,
    otp,
  });
  return response({
    res,
    statusCode: 201,
    data,
  });
});

router.get("/forget-password", verifyToken, async (req, res) => {
  await service.forgetPasswordService({ user: req.user });
  return response({
    res,
    message: "OTP Sent To Your Email",
    data: {},
  });
});

router.post("/reset-password", verifyToken, async (req, res) => {
  const { otp, newPassword, confirmPassword } = req.body;

  const data = await service.resetPasswordService({
    otp,
    newPassword,
    confirmPassword,
    user: req.user,
  });

  return response({
    res,
    statusCode: 202,
    message: "Password Updated Successfully",
    data,
  });
});

export default router;
