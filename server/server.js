const express = require("express");
const app = express();
const superhero_util = require('./script.js');
const port = process.env.PORT || 3000;

app.get("/api/superheros_info", (req, res) => {
    res.send(superhero_util.get_all_info());
});

app.get("/api/superheros_info/match", (req, res) => {
    const field = req.query.field;
    const match = req.query.match;
    const n = req.query.n;
    if (n !== undefined) {
        res.send(superhero_util.match(field, match, n));
    }
    else {
        res.send(superhero_util.match(field, match));
    }
});

app.get("/api/superheros_info/:id", (req, res) => {
    res.send(superhero_util.get_info(req.params.id));
});

app.get("/api/superheros_powers", (req, res) => {
    res.send(superhero_util.get_all_powers());
});

app.get("/api/superheros_powers/:id", (req, res) => {
    res.send(superhero_util.get_powers(req.params.id));
});


app.listen(port, () => console.log(`Listening on port ${port}...`));
