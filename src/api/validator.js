const { check, validationResult } = require("express-validator");

exports.validateUser = [
	check("name")
		.trim()
		.escape()
		.not()
		.isEmpty()
		.withMessage("User name can not be empty!")
		.bail()
		.isLength({ min: 3 })
		.withMessage("Minimum 3 characters required!")
		.bail()
		.isAlpha("en-US", { ignore: " " })
		.withMessage("Username can only contain alphabets")
		.bail(),
	check("email")
		.trim()
		.normalizeEmail()
		.isEmail()
		.not()
		.isEmpty()
		.withMessage("Invalid email address!")
		.bail(),
	check("password")
		.trim()
		.not()
		.isEmpty()
		.withMessage("Password can not be empty!")
		.bail()
		.isLength({
			min: 8,
		})
		.withMessage("Enter a password with 8 or more characters"),
	(req, res, next) => {
		const errors = validationResult(req);

		if (Object.keys(req.body).length > 3) {
			return res.status(422).json({ error: "Invalid parameters" });
		}

		if (!errors.isEmpty())
			return res.status(422).json({ errors: errors.array() });
		next();
	},
];
