const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { emit } = require("../../server");

class User {
	constructor({ name, email, password = {} } = {}) {
		this.name = name;
		this.email = email;
		this.password = password;
	}
	toJson() {
		return { name: this.name, email: this.email };
	}
	async comparePassword(plainText) {
		return await bcrypt.compare(plainText, this.password);
	}
	encoded() {
		return jwt.sign(
			{
				exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
				...this.toJson(),
			},
			process.env.SECRET_KEY
		);
	}
	static async decoded(userJwt) {
		return jwt.verify(userJwt, process.env.SECRET_KEY, (error, res) => {
			if (error) {
				return { error };
			}
			return new User(res);
		});
	}
}

module.exports = User;
