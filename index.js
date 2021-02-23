const app = require("./server");
const dotenv = require("dotenv");
dotenv.config();
const MongoClient = require("mongodb").MongoClient;
const UsersDAO = require("./src/dao/usersDAO");
const RecipeDAO = require("./src/dao/recipeDAO");

MongoClient.connect(process.env.DB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	poolSize: 50,
	wtimeout: 2500,
})
	.catch((err) => {
		console.error(err.stack);
		process.exit(1);
	})
	.then(async (client) => {
		await UsersDAO.injectDB(client);
		await RecipeDAO.injectDB(client);
		app.listen(process.env.PORT, () => {
			console.log(`listening on port ${process.env.PORT}`);
		});
	});
