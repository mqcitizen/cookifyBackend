const RecipeDAO = require("../dao/recipeDAO");
const User = require("../api/User");

class RecipeController {
	static async getRecipes(req, res) {
		try {
			let page = req.body.page || 0;
			const recipesList = await RecipeDAO.getRecipes({ page });
			res.json(recipesList);
		} catch (e) {
			res.status(500).json({ error: e.toString() });
		}
	}

	static async searchRecipes(req, res) {
		try {
			let searchString = req.body.searchString;

			if (!searchString) {
				res.status(500).json({ error: "Please mention search String" });
				return;
			}

			const recipesList = await RecipeDAO.searchRecipes(searchString);
			res.json(recipesList);
		} catch (e) {
			res.status(500).json({ error: e.toString() });
		}
	}

	static async findRecipes(req, res) {
		try {
			let list = req.body.list;

			if (!list) {
				res.status(500).json({ error: "Please add ingredients list" });
				return;
			}

			const recipesList = await RecipeDAO.findRecipes(list);
			res.json(recipesList);
		} catch (e) {
			res.status(500).json({ error: e.toString() });
		}
	}

	static async addIngredient(req, res) {
		try {
			let ingredient = req.body.ingredient;

			if (!ingredient) {
				res.status(500).json({ error: "Please add ingredient" });
				return;
			}
			console.log(ingredient);
			let userJwt = req.get("Authorization");

			if (!userJwt) {
				res.status(500).json({ error: "Token missing" });
				return;
			}

			userJwt = userJwt.slice("Bearer ".length);
			const userObj = await User.decoded(userJwt);
			var { error } = userObj;
			if (error) {
				res.status(401).json({ error });
				return;
			}
			let result = await RecipeDAO.addIngredient(ingredient, userObj);
			var { error } = result;
			if (error) {
				res.status(500).json({ error });
				return;
			}
			res.json(result);
		} catch (e) {
			res.status(500).json({ error: e.toString() });
		}
	}

	static async editIngredient(req, res) {
		try {
			let ingredient = req.body.ingredient;

			if (!ingredient) {
				res.status(500).json({ error: "Please add ingredient" });
				return;
			}

			let userJwt = req.get("Authorization");

			if (!userJwt) {
				res.status(500).json({ error: "Token missing" });
				return;
			}

			userJwt = userJwt.slice("Bearer ".length);
			const userObj = await User.decoded(userJwt);
			var { error } = userObj;
			if (error) {
				res.status(401).json({ error });
				return;
			}
			let result = await RecipeDAO.editIngredient(ingredient, userObj);
			var { error } = result;
			if (error) {
				res.status(500).json({ error });
				return;
			}
			res.json(result);
		} catch (e) {
			res.status(500).json({ error: e.toString() });
		}
	}

	static async deleteIngredient(req, res) {
		try {
			let ingredient = req.body.ingredient;

			if (!ingredient) {
				res.status(500).json({ error: "Please add ingredient" });
				return;
			}

			let userJwt = req.get("Authorization");

			if (!userJwt) {
				res.status(500).json({ error: "Token missing" });
				return;
			}

			userJwt = userJwt.slice("Bearer ".length);
			const userObj = await User.decoded(userJwt);
			var { error } = userObj;
			if (error) {
				res.status(401).json({ error });
				return;
			}
			let result = await RecipeDAO.deleteIngredient(ingredient, userObj);
			var { error } = result;
			if (error) {
				res.status(500).json({ error });
				return;
			}
			res.json(result);
		} catch (e) {
			res.status(500).json({ error: e.toString() });
		}
	}

	static async getIngredients(req, res) {
		try {
			let userJwt = req.get("Authorization");

			if (!userJwt) {
				res.status(500).json({ error: "Token missing" });
				return;
			}

			userJwt = userJwt.slice("Bearer ".length);

			const userObj = await User.decoded(userJwt);
			var { error } = userObj;
			if (error) {
				res.status(401).json({ error });
				return;
			}
			let result = await RecipeDAO.getIngredients(userObj);
			var { error } = result;
			if (error) {
				res.status(500).json({ error });
				return;
			}
			res.json(result);
		} catch (e) {
			console.error(e);
			res.status(500).json({ error: e.toString() });
		}
	}
}

module.exports = RecipeController;
