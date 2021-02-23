const ObjectId = require("bson").ObjectID;
const UsersDAO = require("../dao/usersDAO");
const { v4: uuidv4 } = require("uuid");

const DEFAULT_SORT = [["rating", 1]];

//for sorting recipes by count
//db.allDishes.aggregate([{$project: { "name": 1, "count": { $size: "$ingredientLines" } }},{$sort: {"count": -1}}])

let allDishes;
let ingredientList;

class RecipeDAO {
	static async injectDB(conn) {
		if (ingredientList && allDishes) {
			return;
		}
		try {
			allDishes = conn.db(process.env.NS2).collection("bigIndian");
			ingredientList = conn.db(process.env.NS1).collection("ingredientsList");
		} catch (e) {
			console.error(`Unable to establish collection handles in userDAO: ${e}`);
		}
	}

	static async getRecipes({ page = 0, recipesPerPage = 20 } = {}) {
		let cursor;

		try {
			cursor = await allDishes.find().sort(DEFAULT_SORT);
		} catch (e) {
			console.error(`Unable to issue find command, ${e}`);
			return {
				recipesList: [],
			};
		}
		const displayCursor = cursor
			.skip(recipesPerPage * page)
			.limit(recipesPerPage);
		try {
			const recipesList = await displayCursor.toArray();

			return { recipesList };
		} catch (e) {
			console.error(
				`Unable to convert cursor to array or problem counting documents, ${e}`
			);
			return { recipesList: [] };
		}
	}

	static async searchRecipes(searchString) {
		let cursor;

		try {
			cursor = await allDishes
				.find({ $text: { $search: searchString } })
				.sort(DEFAULT_SORT);
		} catch (e) {
			console.error(`Unable to issue find command, ${e}`);
			return {
				recipesList: [],
			};
		}

		try {
			const recipesList = await cursor.toArray();
			return { recipesList };
		} catch (e) {
			console.error(
				`Unable to convert cursor to array or problem counting documents, ${e}`
			);
			return { recipesList: [] };
		}
	}

	static async findRecipes(list) {
		let cursor;

		let pipeline = [
			{
				$match: {
					ingredients: {
						$all: list,
					},
				},
			},
			{
				$addFields: {
					count: {
						$size: "$ingredients",
					},
				},
			},
			{
				$sort: {
					count: 1,
				},
			},
		];

		try {
			cursor = await allDishes.aggregate(pipeline);
		} catch (e) {
			console.error(`Unable to issue find command, ${e}`);
			return {
				recipesList: [],
			};
		}

		try {
			const recipesList = await cursor.toArray();
			return { recipesList };
		} catch (e) {
			console.error(
				`Unable to convert cursor to array or problem counting documents, ${e}`
			);
			return { recipesList: [] };
		}
	}

	static async addIngredient(ingredient, user) {
		let dbuser;
		try {
			dbuser = await UsersDAO.getUser(user.email);
		} catch (e) {
			console.error(`User doesn't exist, ${e}`);
			return { error: "user not found " };
		}
		if (dbuser == null) {
			return { error: "user not found " };
		}

		ingredient.uuid = uuidv4();

		try {
			await ingredientList.updateOne(
				{ user_id: dbuser.email },
				{ $push: { ingredientsList: ingredient } },
				{ upsert: true }
			);
			return { success: true };
		} catch (e) {
			console.error(`Error occurred while adding igredient, ${e}`);
			return { error: e };
		}
	}

	static async editIngredient(ingredient, user) {
		let dbuser;
		try {
			dbuser = await UsersDAO.getUser(user.email);
		} catch (e) {
			console.error(`User doesn't exist, ${e}`);
			return { error: "user not found " };
		}
		if (dbuser == null) {
			return { error: "user not found " };
		}

		try {
			await ingredientList.updateOne(
				{ user_id: dbuser.email, "ingredientsList.name": ingredient.name },
				{
					$set: {
						"ingredientsList.$.qty": ingredient.qty,
						"ingredientsList.$.unit": ingredient.unit,
					},
				}
			);
			return { success: true };
		} catch (e) {
			console.error(`Error occurred while editing igredient, ${e}`);
			return { error: e };
		}
	}

	static async deleteIngredient(ingredient, user) {
		let dbuser;
		try {
			dbuser = await UsersDAO.getUser(user.email);
		} catch (e) {
			console.error(`User doesn't exist, ${e}`);
			return { error: "user not found " };
		}
		if (dbuser == null) {
			return { error: "user not found " };
		}

		try {
			await ingredientList.updateOne(
				{ user_id: dbuser.email },
				{ $pull: { ingredientsList: { name: ingredient.name } } },
				{ upsert: true }
			);
			return { success: true };
		} catch (e) {
			console.error(`Error occurred while deleting igredient, ${e}`);
			return { error: e };
		}
	}

	static async getIngredients(user) {
		let dbuser;
		try {
			dbuser = await UsersDAO.getUser(user.email);
		} catch (e) {
			console.error(`User doesn't exist, ${e}`);
			return { error: "user not found " };
		}

		let ingredientsList;
		try {
			let ingredientsUser = await ingredientList.findOne({
				user_id: dbuser.email,
			});
			ingredientsList = ingredientsUser.ingredientsList;
			return { ingredientsList };
		} catch (e) {
			console.error(`Unable to issue find command, ${e}`);
			return {
				ingredientsList: [],
			};
		}
	}
}
module.exports = RecipeDAO;
