const express = require("express");
const users = require("./src/api/users.route");
const recipe = require("./src/api/recipe.route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use("/api/v1/users", users);
app.use("/", users);
app.use("/", recipe);
app.use("*", (req, res) => res.status(404).json({ error: "not found" }));

module.exports = app;
