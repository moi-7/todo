import User from "../models/user.js";
import bcrypt from "bcrypt";
import Blacklist from "../models/Blacklist.js";

/**
 * @route POST v1/auth/register
 * @desc Registers a user
 * @access Public
 */

export async function Register(req, res) {
  // get required variables from request body
  // using es6 object destructing
  const { first_name, last_name, email, password } = req.body;
  try {
    // create an instance of a user
    const newUser = new User({
      first_name,
      last_name,
      email,
      password,
    });
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({
        status: "failed",
        data: [],
        message: "It seems you already have an account, please log in instead.",
      });
    const savedUser = await newUser.save(); // save new user into the database
    const { role, ...user_data } = savedUser._doc;
    res.status(200).json({
      status: "success",
      data: [user_data],
      message:
        "Thank you for registering with us. Your account has been successfully created.",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
  res.end();
}

export async function Login(req, res) {
  // Get variables for the login process
  const { email } = req.body;
  // Check if user exists
  const user = await User.findOne({ email }).select("+password");
  if (!user)
    return res.status(401).json({
      status: "failed",
      data: [],
      message: "Account does not exist",
    });
  // if user exists
  // validate password
  const isPasswordValid = await bcrypt.compare(
    `${req.body.password}`,
    user.password
  );
  // if not valid, return unathorized response
  if (!isPasswordValid)
    return res.status(401).json({
      status: "failed",
      data: [],
      message:
        "Invalid email or password. Please try again with the correct credentials.",
    });

  let options = {
    maxAge: 20 * 60 * 1000, // would expire in 20minutes
    httpOnly: true, // The cookie is only accessible by the web server
    secure: true,
    sameSite: "None",
  };
  const token = user.generateAccessJWT(); // generate session token for user
  res.cookie("SessionID", token, options); // set the token to response header, so that the client sends it back on each subsequent request
  res.status(200).json({
    status: "success",
    message: "You have successfully logged in.",
  });

  res.end();
}

export async function Logout(req, res) {
  try {
    const authHeader = req.headers["cookie"]; // get the session cookie from request header
    if (!authHeader) return res.sendStatus(204); // No content
    const cookie = authHeader.split("=")[1]; // If there is, split the cookie string to get the actual jwt token
    const accessToken = cookie.split(";")[0];
    const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken }); // Check if that token is blacklisted
    // if true, send a no content response.
    if (checkIfBlacklisted) return res.sendStatus(204);
    // otherwise blacklist token
    const newBlacklist = new Blacklist({
      token: accessToken,
    });
    await newBlacklist.save();
    // Also clear request cookie on client
    res.setHeader("Clear-Site-Data", '"cookies"');
    res.status(200).json({ message: "You are logged out!" });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
  res.end();
}

/**
 * @route PUT v1/auth/update
 * @desc Updates user information
 * @access Private
 */
export async function UpdateUser(req, res) {
  const { first_name, last_name, email, password } = req.body;
  const userId = req.user.id; // Assuming user ID is available in req.user

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "failed",
        data: [],
        message: "User not found",
      });
    }

    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    const updatedUser = await user.save();
    const { role, ...user_data } = updatedUser._doc;

    res.status(200).json({
      status: "success",
      data: [user_data],
      message: "User information updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
  res.end();
}