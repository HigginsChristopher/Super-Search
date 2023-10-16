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
    let match_result;
    const field = req.query.field;
    const match = req.query.match;
    const n = req.query.n;
    const { error } = superhero_util.validate_match(field,match,n);
    if (error) return res.status(400).send(error.details[0].message);
    if (n !== undefined) {
        match_result = superhero_util.match(field, match, n);
        if (match_result instanceof Error) return res.status(404).send(match_result.message);
    }
    else {
        match_result = superhero_util.match(field, match);
        if (match_result instanceof Error) return res.status(404).send(match_result.message);
    }
    res.send(match_result);
});

app.get("/api/superheros_info/:id", (req, res) => {
    const id = Number(req.params.id);
    const { error } = superhero_util.validate_id(id);
    if (error) return res.status(400).send(error.details[0].message);
    const superhero_info = superhero_util.get_info(id);
    if (superhero_info instanceof Error) return res.status(404).send(superhero_info.message);
    res.send(superhero_info);
});

app.get("/api/superheros_powers", (req, res) => {
    res.send(superhero_util.get_all_powers());
});

app.get("/api/superheros_powers/:id", (req, res) => {
    const id = Number(req.params.id);
    const { error } = superhero_util.validate_id(id);
    if (error) return res.status(400).send(error.details[0].message);
    const superhero_powers = superhero_util.get_powers(id);
    if (superhero_powers instanceof Error) return res.status(404).send(superhero_powers.message);
    res.send(superhero_powers);
});

app.get("/api/lists/ids", (req, res) => {
    const name = req.query.name
    const { error } = superhero_util.validate_name(name);
    if (error) return res.status(400).send(error.details[0].message);
    const list = superhero_util.get_list_ids(name)
    if (list instanceof Error) return res.status(404).send(list.message);
    res.send(list);
});

app.get("/api/lists/details", (req, res) => {
    let id_list;
    try {
        id_list = JSON.parse(req.query.id_list);
    } catch (ignored) {
    }
    const { error } = superhero_util.validate_id_list(id_list);
    if (error) return res.status(400).send(error.details[0].message);
    const list = superhero_util.get_details_from_list(id_list);
    if (list instanceof Error) return res.status(404).send(list.message);
    res.send(list);
})

app.get("/api/lists/:name", (req, res) => {
    const name = req.params.name
    const { error } = superhero_util.validate_name(name);
    if (error) return res.status(400).send(error.details[0].message);
    const list = superhero_util.get_list(name)
    if (list instanceof Error) return res.status(404).send(list.message);
    res.send(list);
});

app.post("/api/lists", (req, res) => {
    const { error } = superhero_util.validate_list(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const name = req.body.name;
    const id_list = req.body.id_list;
    const list = superhero_util.create_list(name, id_list);
    if (list instanceof Error) return res.status(404).send(list.message);
    res.send(list);
})

app.put("/api/lists", (req, res) => {
    const { error } = superhero_util.validate_list(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const name = req.body.name;
    const id_list = req.body.id_list;
    const list = superhero_util.save_list(name, id_list)
    if (list instanceof Error) return res.status(404).send(list.message);
    res.send(list);
})

app.delete("/api/lists/:name", (req, res) => {
    const name = req.params.name
    const { error } = superhero_util.validate_name(name);
    if (error) return res.status(400).send(error.details[0].message);
    const list = superhero_util.delete_list(name);
    if (list instanceof Error) return res.status(404).send(list.message);
    res.send(list);
});

app.listen(port, () => console.log(`Listening on port ${port}...`));
