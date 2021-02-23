const bcrypt = require("bcrypt");
const UsersDAO = require("../dao/usersDAO");
const User = require("../api/User");

const hashPassword = async (password) => await bcrypt.hash(password, 10);

class UserController {
	static async register(req, res) {
		try {
			const userFromBody = req.body;
			let errors = {};

			const userInfo = {
				...userFromBody,
				password: await hashPassword(userFromBody.password),
			};
			userInfo.email = userInfo.email.toLowerCase();
			const insertResult = await UsersDAO.addUser(userInfo);
			if (!insertResult.success) {
				errors.email = insertResult.error;
			}

			const userFromDB = await UsersDAO.getUser(
				userFromBody.email.toLowerCase()
			);
			if (!userFromDB) {
				errors.general = "Internal error, please try again later";
			}
			if (Object.keys(errors).length > 0) {
				res.status(400).json(errors);
				return;
			}

			const user = new User(userFromDB);
			const jwt = user.encoded();
			const loginResult = UsersDAO.loginUser(userInfo.email, jwt);
			console.log("user created");
			res.json({ token: jwt, info: user.toJson() });
		} catch (e) {
			let x = e.toString();
			res.status(500).json({ error: x });
		}
	}

	static nothing(req, res) {
		res.send(`<h1>Hello</h1>`);
	}

	static async login(req, res, next) {
		try {
			const { email, password } = req.body;
			if (!email || typeof email !== "string") {
				res.status(400).json({ error: "Bad email format, expected string." });
				return;
			}
			if (!password || typeof password !== "string") {
				res
					.status(400)
					.json({ error: "Bad password format, expected string." });
				return;
			}
			let userData = await UsersDAO.getUser(email.toLowerCase());
			if (!userData) {
				res.status(401).json({ error: "Make sure your email is correct." });
				console.log("Make sure your email is correct.");
				return;
			}
			const user = new User(userData);

			if (!(await user.comparePassword(password))) {
				res.status(401).json({ error: "Make sure your password is correct." });
				console.log("Make sure your password is correct.");
				return;
			}

			const loginResponse = await UsersDAO.loginUser(
				user.email,
				user.encoded()
			);
			if (!loginResponse.success) {
				res.status(500).json({ error: loginResponse.error });
				return;
			}
			res.json({ token: user.encoded(), info: user.toJson() });
		} catch (e) {
			res.status(400).json({ error: e });
			return;
		}
	}

	static async logout(req, res) {
		try {
			const userJwt = req.get("Authorization").slice("Bearer ".length);
			const userObj = await User.decoded(userJwt);
			var { error } = userObj;
			if (error) {
				res.status(401).json({ error });
				return;
			}
			const logoutResult = await UsersDAO.logoutUser(userObj.email);
			var { error } = logoutResult;
			if (error) {
				res.status(500).json({ error });
				return;
			}
			res.json(logoutResult);
		} catch (e) {
			res.status(500).json(e);
		}
	}
}

module.exports = UserController;
