const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();
const POKEDEX = require("./pokedex.json");

const app = express();

app.use(helmet());
const morganSetting = process.env.NODE_ENV === "production" ? "tiny" : "common";
app.use(morgan(morganSetting));
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
  const authToken = req.get("Authorization");
  const apiToken = process.env.API_TOKEN;

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    return res.status(401).json({ error: "Unauthorized request" });
  }
  // move to the next middleware
  next();
});

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

const validTypes = [
  "Bug",
  "Dark",
  "Dragon",
  "Electric",
  "Fairy",
  "Fighting",
  "Fire",
  "Flying",
  "Ghost",
  "Grass",
  "Ground",
  "Ice",
  "Normal",
  "Poison",
  "Psychic",
  "Rock",
  "Steel",
  "Water"
];

function handleGetTypes(req, res) {
  res.json(validTypes);
}

app.get("/types", handleGetTypes);

function handleGetPokemon(req, res) {
  const store = POKEDEX.pokemon;
  const { name, type } = req.query;

  if (!type && !name) {
    return res.json(store);
  }
  let results = store;

  if (type) {
    results = store.filter(i =>
      i.type.map(t => t.toLowerCase()).includes(type.toLowerCase())
    );
  }

  if (name) {
    results = store.filter(i => i.name.toLowerCase() === name.toLowerCase());
  }
  res.json(results);
}

app.get("/pokemon", handleGetPokemon);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {});
