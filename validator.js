import { check } from "express-validator";

export const notesValidationMessages = [
  check("species").not().isEmpty().withMessage("This field is required"),
  check("flock_size").not().isEmpty().withMessage("This field is required"),
  check("date")
    .not()
    .isEmpty()
    .withMessage("This field is required")
    .matches(/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/)
    .withMessage("Please type in MM/DD/YYYY format")
    .isBefore(new Date().toDateString())
    .withMessage("Date cannot be in the future"),
  check("time")
    .not()
    .isEmpty()
    .withMessage("This field is required")
    .matches(/((1[0-2]|0?[1-9]):([0-5][0-9]) ?([AaPp][Mm]))/)
    .withMessage("Please type in HH:MM (AM/PM) format"),
  check("photo_url")
    .not()
    .isEmpty()
    .withMessage("This field is required")
    .isURL()
    .withMessage("Please enter a valid URL"),
  check("behaviour").not().isEmpty().withMessage("This field is required"),
];

export const commentValidationMessages = [
  check("comment").not().isEmpty().withMessage("This field is required"),
];

export const loginValidationMessages = [
  check("email")
    .not()
    .isEmpty()
    .withMessage("This field is required")
    .isEmail()
    .withMessage("Invalid email format"),
  check("password").not().isEmpty().withMessage("This field is required"),
];
