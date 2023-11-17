// Importing dependencies (express, script.js and validator)
const express = require("express");
const superhero_util = require('./script.js');
const validator = require("validator");

// Setting up port and express application
const port = process.env.PORT || 3000;
const app = express();

// MIDDLEWARE
// Add this middleware to enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Middleware to server task and homepage folders for access on client
app.use("/", express.static("../client"));
app.use("/", express.static("../client/homepage"));

// Middleware to make data in body and response is in JSON
app.use(express.json());

// Middleware to sanitize data and ensuring no special characters in pathname
app.use((req, res, next) => {
    let fullUrl = req.protocol + '://' + req.get('host') + unescape(req.originalUrl);
    fullUrl = fullUrl.split("?")[0];
    // If URL contains special characters in pathname
    if (!validator.isURL(fullUrl, { require_tld: false })) {
        return res.status(400).send(`Invalid input, cannot contain special characters! (e.g. / <>&"')!`);
    }
    // Sanitizing body of request to remove HTML, CSS, JS from body parameters
    if (req.body) {
        superhero_util.sanitize_user_input(req.body);
    }
    // Sanitizing query of request to remove HTML, CSS, JS from query parameters
    if (req.query) {
        superhero_util.sanitize_user_input(req.query);
    }
    next();
});

// ENDPOINTS
// Endpoint to GET all superhero info
app.get("/api/superheros_info", (req, res) => {
    res.send(superhero_util.get_all_info());
});

// Endpoint to GET all publisher info
app.get("/api/superheros_info/publishers", (req, res) => {
    res.send(superhero_util.get_publishers());
});

// Endpoint to GET all list info
app.get("/api/lists", (req, res) => {
    res.send(superhero_util.get_all_lists());
});

// Endpoint to GET all matches for a given field, query and number of results
app.get("/api/superheros_info/match", (req, res) => {
    let match_result;
    // Get fields from query 
    const field = req.query.field;
    // Decode match (can have special characters)
    const match = decodeURIComponent(req.query.match);
    const n = req.query.n;
    // Validate match fields (sanitize)
    const { error } = superhero_util.validate_match(field, match, n);
    // Validation raised error, return error message (400 client error)
    if (error) return res.status(400).send(error.details[0].message);
    // If n is defined, call match with given n
    if (n !== undefined) {
        // Get matches for given field, match, and n
        match_result = superhero_util.match(field, match, n);
        // No matches for field and match, return error message (404 error)
        if (match_result instanceof Error) return res.status(404).send(match_result.message);
    }
    // Use default n defined in method
    else {
        // Get matches for given field and match
        match_result = superhero_util.match(field, match);
        // No matches for field and match, return error message (404 error)
        if (match_result instanceof Error) return res.status(404).send(match_result.message);
    }
    // Send match result to client
    res.send(match_result);
});

// Endpoint to GET superhero info for given id
app.get("/api/superheros_info/:id", (req, res) => {
    // Get fields from params 
    const id = Number(req.params.id);
    // Validate id (sanitize)
    const { error } = superhero_util.validate_id(id);
    // Validation raised error, return error message (400 client error)
    if (error) return res.status(400).send(error.details[0].message);
    // Get superhero information for given id
    const superhero_info = superhero_util.get_info(id);
    // No id matches, return error message (404 error)
    if (superhero_info instanceof Error) return res.status(404).send(superhero_info.message);
    // Send superhero information result to client
    res.send(superhero_info);
});

// Endpoint to GET all superhero powers
app.get("/api/superheros_powers", (req, res) => {
    res.send(superhero_util.get_all_powers());
});

// Endpoint to GET all superhero powers for given id
app.get("/api/superheros_powers/:id", (req, res) => {
    // Get fields from params 
    const id = Number(req.params.id);
    // Validate id (sanitize)
    const { error } = superhero_util.validate_id(id);
    // Validation raised error, return error message (400 client error)
    if (error) return res.status(400).send(error.details[0].message);
    // Get power information for given id
    const superhero_powers = superhero_util.get_powers(id);
    // No id matches, return error message (404 error)
    if (superhero_powers instanceof Error) return res.status(404).send(superhero_powers.message);
    // Send power information result to client
    res.send(superhero_powers);
});

// Endpoint to GET all list_id for a given list name
app.get("/api/lists/ids", (req, res) => {
    // Decode name (can have special characters)
    const name = decodeURIComponent(req.query.name)
    // Validate name (sanitize)
    const { error } = superhero_util.validate_name(name);
    // Validation raised error, return error message (400 client error)
    if (error) return res.status(400).send(error.details[0].message);
    // Get list_id for given name
    const list = superhero_util.get_list_ids(name)
    // No name matches, return error message (404 error)
    if (list instanceof Error) return res.status(404).send(list.message);
    // Send id_list to client
    res.send(list);
});

// Endpoint to GET all superhero and power info for a given list of ids
app.get("/api/lists/details", (req, res) => {
    let id_list;
    // Parse id_list from query
    try {
        // Get id_list from query 
        id_list = JSON.parse(req.query.id_list);
    } catch (ignored) { }
    // Validate id list (sanitize)
    const { error } = superhero_util.validate_id_list(id_list);
    // Validation raised error, return error message (400 client error)
    if (error) return res.status(400).send(error.details[0].message);
    // Get details for given id_list
    const list = superhero_util.get_details_from_list(id_list);
    // No id matches, return error message (404 error)
    if (list instanceof Error) return res.status(404).send(list.message);
    // Send details to client
    res.send(list);
})

// Endpoint to GET list for given name
app.get("/api/lists/:name", (req, res) => {
    // Get name from params
    const name = req.params.name
    // Validate name (sanitize)
    const { error } = superhero_util.validate_name(name);
    // Validation raised error, return error message (400 client error)
    if (error) return res.status(400).send(error.details[0].message);
    // Get list for given name
    const list = superhero_util.get_list(name)
    // No name matches, return error message (404 error)
    if (list instanceof Error) return res.status(404).send(list.message);
    // Send list to client
    res.send(list);
});

// Endpoint to POST, in this case create, list for given name and id_list
app.post("/api/lists", (req, res) => {
    // Validate create list details (sanitize)
    const { error } = superhero_util.validate_create_list(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    // Get name and id list from body
    const name = req.body["list-name"];
    const superhero_ids = req.body.superhero_ids;
    const description = req.body.description;
    const visibility = req.body.visibility;
    // Create list with given name and id list
    const list = superhero_util.create_list(name, superhero_ids, description, visibility);
    // List name already exists, return error message (404 error)
    if (list instanceof Error) return res.status(404).send(list.message);
    res.send(list);
})

// Route to handle /api/lists/:id with a given id parameter
app.route("/api/lists/:id")
    // Endpoint to POST, in this case update, a list with the given id and id_list
    .post((req, res) => {
        const list_object = {
            // Get id from params
            id: req.params.id,
            "list-name": req.body["list-name"],
            // Get id list from body
            superhero_ids: req.body.superhero_ids,
            description: req.body.description,
            visibility: req.body.visibility
        }
        // Validate update list details (sanitize)
        const { error } = superhero_util.validate_update_list(list_object);
        // Validation raised error, return error message (400 client error)
        if (error) return res.status(400).send(error.details[0].message);
        // Save list with given id and id list
        const list = superhero_util.save_list(list_object)
        // List with given ID doesn't exist, return error message (404 error)
        if (list instanceof Error) return res.status(404).send(list.message);
        res.send(list);
    })
    // Endpoint to DELETE a list with the given id and id_list
    .delete((req, res) => {
        // Get id from params
        const id = req.params.id
        // Validate id (sanitize)
        const { error } = superhero_util.validate_id(id);
        // Validation raised error, return error message (400 client error)
        if (error) return res.status(400).send(error.details[0].message);
        // Delete list with given id
        const list = superhero_util.delete_list(id);
        // List with given ID doesn't exist, return error message (404 error)
        if (list instanceof Error) return res.status(404).send(list.message);
        res.send(list);
    });

// Listening to application and displaying port number
app.listen(port, () => console.log(`Listening on port ${port}...`));