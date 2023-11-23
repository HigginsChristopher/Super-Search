// Importing dependencies (express, script.js and validator)
const express = require("express");
const superhero_util = require('./script.js');
const validator = require("validator");
const jwt = require('jsonwebtoken');

// Setting up port and express application
const port = process.env.PORT || 3000;
const app = express();

//const crypto = require('crypto');
// Generate a random key
// const generateRandomKey = () => {
//     return crypto.randomBytes(64).toString('hex');
// };
//const secretKey = generateRandomKey();

const secretKey = "c25a959c1565f04b62c983c9e7413bff2bf873db9a1460a2e91c97f14c092cd982c26a8dcb8ff018b785e77214056efd55425ae4107e1fb6836e35649aeab2b8";

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    let token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    token = token.split(' ')[1]
    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        req.user = user;
        next();
    });
};

// MIDDLEWARE
// // Add this middleware to enable CORS
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
// });

// Middleware to make data in body and response is in JSON
app.use(express.json());

// Middleware to sanitize data and ensuring no special characters in pathname
app.use((req, res, next) => {
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
// Login endpoint
app.post('/api/open/login', async (req, res) => {
    const user = await superhero_util.get_user(req.body);
    if (!(user instanceof Error)) {
        // Generate JWT token
        const token = jwt.sign({ user_id: user.id, email: user.email, username: user.username }, secretKey, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: user.message });
    }
});

// Registration endpoint
app.post('/api/open/register', async (req, res) => {
    const user = await superhero_util.create_user(req.body);
    if (!(user instanceof Error)) {
        res.json({ verificationToken: user.verificationToken });
    } else {
        res.status(401).json({ message: user.message });
    }
});

// Verification endpoint
app.get('/api/open/verify', (req, res) => {
    const user = superhero_util.verify_user(req.query.token);
    if (!(user instanceof Error)) {
        // Return a response indicating successful verification
        res.json({ message: 'Email verified successfully' });
    } else {
        // Return a response indicating unsuccessful verification
        res.status(400).json({ message: user.message });
    }
});

// Route to handle /api/secure/lists
app.route("/api/secure/lists/")
    // get private lists
    .get(authenticateToken, (req, res) => {
        const lists = superhero_util.get_private_lists(req.user.user_id);
        res.send(lists);
    })
    // create private list
    .post(authenticateToken, (req, res) => {
        const list_object = {
            user_id: req.user.user_id,
            "list-name": req.body["list-name"],
            superhero_ids: req.body.superhero_ids,
            description: req.body.description,
            visibility: req.body.visibility
        }
        const { error } = superhero_util.validate_create_list(list_object);
        if (error) return res.status(400).send(error.details[0].message);
        const list = superhero_util.create_list(list_object);
        if (list instanceof Error) return res.status(404).send(list.message);
        res.send(list);
    })
    // delete private list
    .delete(authenticateToken, (req, res) => {
        const { error } = superhero_util.validate_name(req.body["list-name"]);
        if (error) return res.status(400).send(error.details[0].message);
        const list = superhero_util.delete_list(req.user.user_id, req.body["list-name"]);
        if (list instanceof Error) return res.status(404).send(list.message);
        res.status(204).end();
    });

// update private list
app.post("/api/secure/lists/:id", authenticateToken, (req, res) => {
    const list_object = {
        user_id: req.user.user_id,
        list_id: parseInt(req.params.id),
        "list-name": req.body["list-name"],
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
});

// get public lists
app.get("/api/open/lists", (req, res) => {
    const lists = superhero_util.get_recent_public_lists(req.body);
    res.send(lists);
})

// Endpoint to GET all matches for given filters with n results
app.get("/api/open/superheros_info/match", (req, res) => {
    match_result = superhero_util.match(req.body.filters, req.body.n);
    // Send match result to client
    res.send(match_result);
});

// Endpoint to GET all details (info/powers) for a given list of ids
app.get("/api/open/superheros_info", (req, res) => {
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
    const list = superhero_util.get_details_id_list(id_list);
    // No id matches, return error message (404 error)
    if (list instanceof Error) return res.status(404).send(list.message);
    // Send details to client
    res.send(list);
})

// Endpoint to GET superhero details (info/powers) for given id
app.get("/api/open/superheros_info/:id", (req, res) => {
    // Get fields from params 
    const id = Number(req.params.id);
    // Validate id (sanitize)
    const { error } = superhero_util.validate_id(id);
    // Validation raised error, return error message (400 client error)
    if (error) return res.status(400).send(error.details[0].message);
    // Get superhero information for given id
    const superhero_info = superhero_util.get_details_id(id);
    // No id matches, return error message (404 error)
    if (superhero_info instanceof Error) return res.status(404).send(superhero_info.message);
    // Send superhero information result to client
    res.send(superhero_info);
});

// Listening to application and displaying port number
app.listen(port, () => console.log(`Listening on port ${port}...`));