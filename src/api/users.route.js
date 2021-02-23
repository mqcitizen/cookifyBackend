const express = require("express");
const router = express.Router();
const UserController = require("./users.controller");
const { validateUser } = require("./validator");

router.route("/").get(UserController.nothing);

router.route("/register").post(validateUser, UserController.register);

router.route("/login").post(UserController.login);

router.route("/logout").post(UserController.logout);

module.exports = router;
