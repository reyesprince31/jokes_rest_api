import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import { jokes } from "./jokes.js";

const app = express();
const port = process.env.PORT || 3000;
const masterKey = process.env.MASTER_API_KEY;

app.use(bodyParser.urlencoded({ extended: true }));

//1. GET a random joke
app.get("/random", (req, res) => {
  try {
    const randomIndex = Math.floor(Math.random() * jokes.length);

    if (!jokes.length) throw new Error(`No jokes found`);

    res.json(jokes[randomIndex]);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "No Joke found" });
  }
});

//2. GET a specific joke
app.get("/jokes/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const foundJoke = jokes.find((joke) => joke.id === id);

    if (!foundJoke) throw new Error(`No ${id} found`);

    res.json(foundJoke);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Joke not found" });
  }
});

//3. GET a jokes by filtering on the joke type
app.get("/filter", (req, res) => {
  try {
    const type = req.query.type;
    const filteredJoke = jokes.filter((joke) => joke.jokeType === type);

    if (!filteredJoke) throw new Error(`type match not found`);

    res.json(filteredJoke);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Jokes not found" });
  }
});

//4. POST a new joke
app.post("/jokes", (req, res) => {
  const { text, type } = req.body;

  const newJoke = {
    id: jokes.length + 1,
    jokeText: text,
    jokeType: type,
  };

  jokes.push(newJoke);
  res.json(newJoke);
});

//5. PUT a joke
app.put("/jokes/:id", (req, res) => {
  const { text, type } = req.body;
  const id = parseInt(req.params.id);

  const replaceJoke = {
    id,
    jokeText: text,
    jokeType: type,
  };

  const searchIndex = jokes.findIndex((joke) => joke.id === id);

  if (searchIndex !== -1) {
    jokes[searchIndex] = replaceJoke;
    res.json(jokes[searchIndex]);
  } else {
    res.status(404).json({ message: `joke ${id} not found` });
  }
});

//6. PATCH a joke
app.patch("/jokes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const existingJoke = jokes.find((joke) => joke.id === id);

  if (!existingJoke) return res.status(404).json({ message: "joke not found" });

  const { text, type } = req.body;
  const patchJoke = {
    id: id,
    jokeText: text || existingJoke.jokeText,
    jokeType: type || existingJoke.jokeType,
  };

  const searchIndex = jokes.findIndex((joke) => joke.id === id);
  jokes[searchIndex] = patchJoke;
  res.json(patchJoke);
});

//7. DELETE Specific joke
app.delete("/jokes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const searchIndex = jokes.findIndex((joke) => joke.id === id);
  if (searchIndex !== -1) {
    jokes.splice(searchIndex, 1);
    res.json({ message: "A joke deleted successfully" });
  } else {
    res
      .status(404)
      .json({ error: `You are not authorised to perform this action.` });
  }
});

//8. DELETE All jokes
app.delete("/all", (req, res) => {
  const userKey = req.query.key;

  if (userKey === masterKey) {
    jokes = [];
    res.json({ message: "All jokes deleted successfully" });
  } else {
    res
      .status(404)
      .json({ error: `You are not authorised to perform this action.` });
  }
});

app.listen(port, () => {
  console.log(`Successfully started server on port ${port}.`);
});
