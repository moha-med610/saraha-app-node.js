import { Users } from "../../db/models/users.model.js";
import { sendEmail } from "../../config/nodemailer.config.js";
import { otpGenerated } from "../../utils/otpGenerator.js";
import { ServerError } from "../../utils/serverError.js";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { PROVIDER } from "../../constants/provider.js";
import { Logout } from "../../constants/flag.js";
import { accessTokenService, refreshTokenService } from "../../utils/tokens.js";
import { RevokeToken } from "../../db/models/token.model.js";
import { redisClient } from "../../db/redis.connection.js";
import {
  otpEmailTemplate,
  resetPasswordEmailTemplate,
} from "../../utils/emailTemp.js";
import { generateResetToken, hashToken } from "../../utils/resetPassword.js";

const client = new OAuth2Client();

export const signupService = async ({
  firstName,
  lastName,
  email,
  password,
}) => {
  const isEmailExist = await Users.findOne({ email });
  if (isEmailExist) {
    throw new ServerError(false, 400, "Email Already Exist");
  }

  let hashedPassword;

  if (password) {
    hashedPassword = await bcrypt.hash(password, 12);
  }
  const newUser = Users({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    otpExpire: new Date(Date.now() + 5 * 60 * 1000),
  });

  await newUser.save();

  sendEmail({
    email: newUser.email,
    html: otpEmailTemplate({
      userName: newUser.firstName,
      otpCode: otpGenerated.toString(),
      expiryMinutes: 5,
    }),
  }).catch((e) => console.log("Error to Send Email"));

  await redisClient.setEx(
    `${newUser.email}:confirmEmailOtp`,
    5 * 60,
    otpGenerated.toString(),
  );

  return { message: "User Created Successfully, Check Your Email For OTP" };
};

export const loginService = async ({ email, password }) => {
  const findUser = await Users.findOne({ email });

  if (!findUser) {
    throw new ServerError(false, 400, "Invalid Credentials");
  }

  if (findUser.provider === PROVIDER.google) {
    throw new ServerError(false, 400, "use google login");
  }

  const isCorrectPassword = await bcrypt.compare(password, findUser.password);

  if (!isCorrectPassword) {
    throw new ServerError(false, 400, "Invalid Credentials");
  }

  if (findUser.isEnableTwoFactorAuth) {
    await redisClient.setEx(
      `${findUser.email}:otp`,
      5 * 60,
      otpGenerated.toString(),
    );

    findUser.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
    await findUser.save();

    await redisClient.setEx(
      `${findUser.email}:confirmOtp`,
      5 * 60,
      otpGenerated.toString(),
    );

    sendEmail({
      email: findUser.email,
      html: otpEmailTemplate({
        userName: findUser.firstName,
        otpCode: otpGenerated.toString(),
        expiryMinutes: 5,
      }),
    }).catch((e) => console.log("Error to Send Email"));

    return "Check Your Email, We Send OTP";
  }

  const accessToken = accessTokenService({
    payload: { id: findUser._id, role: findUser.role, email: findUser.email },
  });

  const refreshToken = refreshTokenService({
    payload: { id: findUser._id, role: findUser.role, email: findUser.email },
  });

  return { accessToken, refreshToken };
};

export const googleSignUp = async ({ googleToken }) => {
  const ticket = await client.verifyIdToken({
    idToken: googleToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { name, email, email_verified } = ticket.getPayload();

  const isEmailExist = await Users.findOne({ email });

  let accessToken;
  let refreshToken;

  if (isEmailExist) {
    if (isEmailExist.provider === PROVIDER.system) {
      throw new ServerError(false, 400, "use system login");
    }

    accessToken = accessTokenService({
      payload: {
        id: isEmailExist._id,
        role: isEmailExist.role,
        email: isEmailExist.email,
      },
    });

    refreshToken = refreshTokenService({
      payload: {
        id: isEmailExist._id,
        role: isEmailExist.role,
        email: isEmailExist.email,
      },
    });
  } else {
    const newUser = await Users.create({
      userName: name,
      email,
      provider: PROVIDER.google,
      isActivate: email_verified,
    });

    accessToken = accessTokenService({
      payload: { id: newUser._id, role: newUser.role, email: newUser.email },
    });

    refreshToken = refreshTokenService({
      payload: { id: newUser._id, role: newUser.role, email: newUser.email },
    });
  }

  return { accessToken, refreshToken };
};

export const logoutService = async ({ user, jti, iat, flag = Logout.all }) => {
  if (flag == Logout.all) {
    user.credential_change_at = new Date();
    await user.save();
  } else {
    await RevokeToken.create({
      userId: user.id,
      jti,
      expireIn: new Date((iat + 14 * 24 * 60 * 60) * 1000),
    });
  }
  return { msg: "Logged out Successfully" };
};

export const enableTwoFactorAuthService = async ({ user, isEnable }) => {
  user.isEnableTwoFactorAuth = isEnable;
  await findUser.save();

  return { msg: "Two Factor Authentication Enabled Successfully" };
};

export const forgetPasswordService = async ({ email }) => {
  const user = await Users.findOne({ email });

  if (!user) {
    throw new ServerError(false, 404, "User Not Found");
  }

  const resetToken = generateResetToken();
  const hashedResetToken = hashToken(resetToken);

  user.resetPasswordToken = hashedResetToken;
  user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  sendEmail({
    email: user.email,
    html: resetPasswordEmailTemplate({
      resetLink: `http://localhost:${process.env.PORT}/reset-password?token=${resetToken}`,
      userName: user.userName,
      email: user.email,
    }),
  });
};

export const resetPasswordService = async ({ token, newPassword }) => {
  const hashedToken = hashToken(token);

  const user = await Users.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: new Date() },
  });

  if (!user) {
    throw new ServerError(false, 400, "Invalid or expired reset token");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
};

export const confirmEmailService = async ({ email, otp }) => {
  const user = await Users.findOne({ email });

  if (!user) {
    throw new ServerError(false, 404, "User Not Found");
  }

  const confirmEmailOtp = await redisClient.get(
    `${user.email}:confirmEmailOtp`,
  );

  if (new Date(user.otpExpire) <= Date.now()) {
    throw new ServerError(false, 400, "OTP Expired");
  }

  if (!confirmEmailOtp || confirmEmailOtp != otp) {
    throw new ServerError(false, 400, "Invalid OTP");
  }

  user.isActivate = true;
  user.otpExpire = undefined;
  await user.save();

  await redisClient.del(`${user.email}:confirmEmailOtp`);

  const accessToken = accessTokenService({
    payload: { id: user._id, role: user.role, email: user.email },
  });

  const refreshToken = refreshTokenService({
    payload: { id: user._id, role: user.role, email: user.email },
  });

  return { message: "Email Confirmed Successfully", accessToken, refreshToken };
};

export const confirmOtpService = async ({ email, otp }) => {
  const user = await Users.findOne({ email });

  if (!user) {
    throw new ServerError(false, 404, "User Not Found");
  }

  const confirmOtp = await redisClient.get(`${user.email}:confirmOtp`);

  if (!confirmOtp || confirmOtp != otp) {
    throw new ServerError(false, 400, "Invalid OTP");
  }

  if (new Date(user.otpExpire) <= Date.now()) {
    throw new ServerError(false, 400, "OTP Expired");
  }

  user.otpExpire = undefined;
  await user.save();

  await redisClient.del(`${user.email}:confirmOtp`);

  const accessToken = accessTokenService({
    payload: { id: user._id, role: user.role, email: user.email },
  });

  const refreshToken = refreshTokenService({
    payload: { id: user._id, role: user.role, email: user.email },
  });

  return { message: "OTP Verified Successfully", accessToken, refreshToken };
};
