import express from "express";
import { Register } from "../controllers/auth.js";
import Validate from "../middleware/validate.js";
import { check } from "express-validator";
import { Login, Logout } from "../controllers/auth.js";

const router = express.Router();

// Register route -- POST request
router.post(
  "/register",
  check("email")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),
  check("first_name")
    .not()
    .isEmpty()
    .withMessage("You first name is required")
    .trim()
    .escape(),
  check("last_name")
    .not()
    .isEmpty()
    .withMessage("You last name is required")
    .trim()
    .escape(),
  check("password")
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("Must be at least 8 chars long"),
  Validate,
  Register
);

// Login route == POST request
router.post(
  "/login",
  check("email")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),
  check("password").not().isEmpty(),
  Validate,
  Login
);

router.get("/logout", Logout);

// Edit users -- PUT request
router.put(
  "/edit",
  check("email")
    .optional()
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),
  check("first_name")
    .optional()
    .not()
    .isEmpty()
    .withMessage("First name cannot be empty")
    .trim()
    .escape(),
  check("last_name")
    .optional()
    .not()
    .isEmpty()
    .withMessage("Last name cannot be empty")
    .trim()
    .escape(),
  check("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Must be at least 8 chars long"),
  Validate,
  (req, res) => {
    // Logic to update user information
    res.send("User information updated");
  }
);

export default router;
