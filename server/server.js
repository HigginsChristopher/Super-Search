const express = require("express");
const superhero_util = require('./script.js');
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.get("/api/superheros_info", (req, res) => {
    res.send(superhero_util.get_all_info());
});

app.get("/api/superheros_info/publishers", (req, res) => {
    res.send(superhero_util.get_publishers());
});

app.get("/api/superheros_info/match", (req, res) => {
    const field = req.query.field;
    const valid_fields = [
        "id",
        "name",
        "Gender",
        "Eye color",
        "Race",
        "Hair color",
        "Height",
        "Publisher",
        "Skin color",
        "Alignment",
        "Weight"
    ]
    if (!valid_fields.includes(field)) {
        return res.status(404).send(`No field name called '${field}'!`);
    }
    const match = req.query.match;
    const n = req.query.n;
    if (n !== undefined) {
        const match_result = superhero_util.match(field, match, n);
        if (match_result instanceof Error) return res.status(404).send(match_result.message);
        res.send(match_result);
    }
    else {
        const match_result = superhero_util.match(field, match);
        if (match_result instanceof Error) return res.status(404).send(match_result.message);
        res.send(match_result);
    }
});

app.get("/api/superheros_info/:id", (req, res) => {
    const superhero_info = superhero_util.get_info(req.params.id);
    if (superhero_info instanceof Error) return res.status(404).send(superhero_info.message);
    res.send(superhero_info);
});

app.get("/api/superheros_powers", (req, res) => {
    res.send(superhero_util.get_all_powers());
});

app.get("/api/superheros_powers/:id", (req, res) => {
    const superhero_powers = superhero_util.get_powers(req.params.id)
    if (superhero_powers instanceof Error) return res.status(404).send(superhero_powers.message);
    res.send(superhero_powers);
});

app.get("/api/lists/ids", (req, res) => {
    const name = req.query.name;
    res.send(superhero_util.get_list_ids(name));
});

app.get("/api/lists/details", (req, res) => {
    const list = superhero_util.get_details_from_list(req.query.id_list);
    if (list instanceof Error) return res.status(404).send(list.message);
    res.send(list);
})

app.get("/api/lists/:name", (req, res) => {
    const list = superhero_util.get_list(req.params.name)
    if (list) return res.status(404).send(list.message);
    res.send(superhero_util.get_list(list.message));
});

app.post("/api/lists", (req, res) => {
    const { error } = superhero_util.validate_list(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const name = req.body.name;
    const id_list = req.body.id_list;
    const list = superhero_util.create_list(name, id_list);
    if (list) return res.status(404).send(list.message);
    res.send(list);
})

app.put("/api/lists", (req, res) => {
    const { error } = superhero_util.validate_list(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const name = req.body.name;
    const id_list = req.body.id_list;
    const list = superhero_util.save_list(name, id_list)
    if (list) return res.status(404).send(list.message);
    res.send(list);
})

app.delete("/api/lists/:name", (req, res) => {
    const name = req.params.name;
    const list = superhero_util.delete_list(name);
    if (list) return res.status(404).send(list.message);
    res.send(list);
});

app.listen(port, () => console.log(`Listening on port ${port}...`));
