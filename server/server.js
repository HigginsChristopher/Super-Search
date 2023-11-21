// Importing dependencies (express, script.js and validator)
const express = require("express");
const superhero_util = require('./script.js');
const validator = require("validator");
const jwt = require('jsonwebtoken');
//const crypto = require('crypto');

// Setting up port and express application
const port = process.env.PORT || 3000;
const app = express();

// Generate a random key
// const generateRandomKey = () => {
//     return crypto.randomBytes(64).toString('hex');
// };
//const secretKey = generateRandomKey();

const secretKey = "c25a959c1565f04b62c983c9e7413bff2bf873db9a1460a2e91c97f14c092cd982c26a8dcb8ff018b785e77214056efd55425ae4107e1fb6836e35649aeab2b8";

// Middleware to authenticate JWT token

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        req.user = user;
        next();
    });
};

// MIDDLEWARE
// Add this middleware to enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

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
// Endpoint to GET all list info
app.get("/api/secure/lists", authenticateToken,(req, res) => {
    res.send(superhero_util.get_all_lists());
});

// Authentication endpoint
app.post('/api/open/login', async (req, res) => {
    const user = await superhero_util.get_user(req.body);
    if (!(user instanceof Error)) {
        // Generate JWT token
        const token = jwt.sign({ userId: user.id, email: user.email }, secretKey, { expiresIn: '1h' });
        user.jwtToken = token;
        res.json({ user });
    } else {
        res.status(401).json({ message: user.message });
    }
});

// Registration endpoint
app.post('/api/open/register', async (req, res) => {
    const user = await superhero_util.create_user(req.body);
    if (!(user instanceof Error)) {
        // Generate JWT token
        const token = jwt.sign({ userId: user.id, email: user.email }, secretKey, { expiresIn: '1h' });
        user.jwtToken = token;
        res.json({ user });
    } else {
        res.status(401).json({ message: user.message });
    }
});

app.get('/api/open/verify', (req, res) => {
    const user = superhero_util.verify_user(req.query.token);
    if (!(user instanceof Error)) {
        // Return a response indicating successful verification
        res.json({ message: 'Email verified successfully' });
    } else {
        // Return a response indicating unsuccessful verification
        res.status(400).json({ message: 'Invalid verification token' });
    }
});

// Endpoint to GET all matches for a given field, query and number of results
app.get("/api/open/superheros_info/match", (req, res) => {
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
app.get("/api/open/superheros_info/:id", (req, res) => {
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

// Endpoint to GET all superhero powers for given id
app.get("/api/open/superheros_powers/:id", (req, res) => {
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

// Endpoint to GET list_id for a given list id
app.get("/api/open/lists/:id", (req, res) => {
    // Decode name (can have special characters)
    const id = req.query.id;
    // Validate name (sanitize)
    const { error } = superhero_util.validate_id(id);
    // Validation raised error, return error message (400 client error)
    if (error) return res.status(400).send(error.details[0].message);
    // Get list_id for given name
    const list = superhero_util.get_list_ids(id)
    // No name matches, return error message (404 error)
    if (list instanceof Error) return res.status(404).send(list.message);
    // Send id_list to client
    res.send(list);
});

// Endpoint to GET all superhero and power info for a given list of ids
app.get("/api/open/lists/details", (req, res) => {
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

// Endpoint to GET all superhero and power info for a given list of ids
app.get("/api/open/lists/", (req, res) => {
    // Get details for given id_list
    const lists = superhero_util.get_recent_public_lists(req.body);
    // No id matches, return error message (404 error)
    if (lists instanceof Error) return res.status(404).send(lists.message);
    // Send details to client
    res.send(lists);
})


// Endpoint to POST, in this case create, list for given name and id_list
app.post("/api/secure/lists", authenticateToken,(req, res) => {
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
app.route("/api/secure/lists/:id")
    // Endpoint to POST, in this case update, a list with the given id and id_list
    .post(authenticateToken,(req, res) => {
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
    .delete(authenticateToken, (req, res) => {
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