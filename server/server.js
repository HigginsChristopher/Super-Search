const express = require("express");
const app = express();
const superhero_util = require('./script.js');
const port = process.env.PORT || 3000;


app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get("/api/superheros_info", (req, res) => {
    res.send(superhero_util.get_all_info());
});

app.get("/api/superheros_info/:id", (req, res) => {
    res.send(superhero_util.get_info(req.params.id));
});


app.listen(port, () => console.log(`Listening on port ${port}...`));
