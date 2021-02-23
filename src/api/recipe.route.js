const express = require("express");
const router = express.Router();
const RecipeController = require("./recipe.controller");

router.route("/recipes").post(RecipeController.getRecipes);

router.route("/searchRecipes").post(RecipeController.searchRecipes);

router.route("/findRecipes").post(RecipeController.findRecipes);

router.route("/addIngredient").post(RecipeController.addIngredient);

router.route("/getIngredients").post(RecipeController.getIngredients);

router.route("/deleteIngredient").post(RecipeController.deleteIngredient);

router.route("/editIngredient").post(RecipeController.editIngredient);

module.exports = router;
