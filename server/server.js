// Importing dependencies (express, script.js and validator)
const express = require("express");
const superhero_util = require('./script.js');
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

const checkAdmin = (req, res, next) => {
    // Assuming you have the authenticated user in req.user
    if (req.user && (req.user.userType === "admin" || req.user.userType === "owner")) {
        // User is an admin
        return next();
    } else {
        // User is not an admin
        return res.status(403).json({ message: 'Forbidden - Admins only' });
    }
};


const checkOwner = (req, res, next) => {
    // Assuming you have the authenticated user in req.user
    if (req.user && (req.user.userType === "owner")) {
        // User is an admin
        return next();
    } else {
        // User is not an admin
        return res.status(403).json({ message: 'Forbidden - Owner only' });
    }
};

// MIDDLEWARE

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
app.post('/api/admin/dcma/', authenticateToken, async (req, res) => {
    const claim = superhero_util.create_claim(req.body.dcma);
    res.send(claim);
});

app.post('/api/admin/dcma/:id', authenticateToken, async (req, res) => {
    req.body.dcma.claim_id = req.params.id;
    const claim = superhero_util.update_claim(req.body.dcma);
    res.send(claim);
});

app.get('/api/admin/dcma/', authenticateToken, async (req, res) => {
    const claims = superhero_util.get_claims();
    res.send(claims);
});


app.get('/api/admin/reviews/', authenticateToken, async (req, res) => {
    const reviews = superhero_util.get_reviews();
    res.send(reviews);
});

app.post('/api/owner/users/admin/:id', authenticateToken, checkOwner, async (req, res) => {
    const users = superhero_util.admin_user(req.params.id);
    res.send(users);
});

app.get('/api/admin/users/', authenticateToken, checkAdmin, async (req, res) => {
    const users = superhero_util.get_all_user_info(req.user.userType);
    res.send(users);
});

app.post('/api/admin/users/disable/:id', authenticateToken, checkAdmin, async (req, res) => {
    const user = superhero_util.disable_user(req.params.id);
    res.send(user);
});

app.post('/api/admin/reviews/flag/:id', authenticateToken, checkAdmin, async (req, res) => {
    const review = superhero_util.flag_review(req.params.id);
    res.send(review);
});

app.get('/api/open/reviews/:id', (req, res) => {
    const reviews = superhero_util.get_reviews_list_id(req.params.id)
    if (reviews instanceof Error) {
        res.send({ message: reviews.message });
    }
    else {
        res.send(reviews);
    }
});

app.post('/api/secure/lists/reviews/', authenticateToken, (req, res) => {
    req.body.user_id = req.user.user_id;
    const review = superhero_util.review_list(req.body);
    if (review instanceof Error) {
        res.send({ message: review.message });
    }
    else {
        res.send(review);
    }
});
// Login endpoint
app.post('/api/open/users/login', async (req, res) => {
    const user = await superhero_util.login_user(req.body);

    if (!(user instanceof Error)) {
        // Generate JWT token
        const token = jwt.sign({ user_id: user.id, email: user.email, username: user.username, userType: user.userType }, secretKey, { expiresIn: '1h' });
        res.json({ token: token });
    } else {
        res.status(401).json({ message: user.message });
    }
});

// Registration endpoint
app.post('/api/open/users/register', async (req, res) => {
    const user = await superhero_util.create_user(req.body);
    if (!(user instanceof Error)) {
        const return_user = {
            email: user.email,
            verificationToken: user.verificationToken
        }
        res.json({ user: return_user });
    } else {
        res.status(401).json({ message: user.message });
    }
});

// Registration endpoint
app.post('/api/open/users/recovery', async (req, res) => {
    const user = superhero_util.account_recovery(req.body.email);
    if (!(user instanceof Error)) {
        const token = jwt.sign({ user_id: user.id, email: user.email, username: user.username, userType: user.userType }, secretKey, { expiresIn: '1h' });
        res.json({ token: token });
    } else {
        res.status(401).json({ message: user.message });
    }
});

app.post('/api/secure/users/password/', authenticateToken, async (req, res) => {
    const user = superhero_util.reset_password(req.user.user_id,req.body.password);
    if (!(user instanceof Error)) {
        res.json(user);
    } else {
        res.status(401).json({ message: user.message });
    }
});

// Verification endpoint
app.get('/api/open/users/verify', async (req, res) => {
    const user = await superhero_util.verify_user(req.query.token);
    if (!(user instanceof Error)) {
        const token = jwt.sign({ user_id: user.id, email: user.email, username: user.username, userType: user.userType }, secretKey, { expiresIn: '1h' });
        res.json({ token: token });
    } else {
        // Return a response indicating unsuccessful verification
        res.status(400).json({ message: user.message });
    }
});

// Verification endpoint
app.post('/api/open/users/verify/resend/', async (req, res) => {
    const user = superhero_util.resend_verification(req.body.email);
    if (user !== undefined) {
        const return_user = {
            email: user.email,
            verificationToken: user.verificationToken
        }
        res.json({ user: return_user });
    } else {
        // Return a response indicating unsuccessful verification
        res.status(400).json({ message: "Email to verify does not exist!" });
    }
});

// Endpoint to GET username for given user id
app.get("/api/open/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const user = superhero_util.get_user(id).value();
    if (user instanceof Error) return res.status(404).send(user.message);
    res.send({ username: user.username });
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


app.route("/api/secure/lists/:id")
    .post(authenticateToken, (req, res) => {
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
    })
    // delete private list
    .delete(authenticateToken, (req, res) => {
        const { error } = superhero_util.validate_id(req.params.id);
        if (error) return res.status(400).send(error.details[0].message);
        const list = superhero_util.delete_list(req.user.user_id, parseInt(req.params.id));
        if (list instanceof Error) return res.status(404).send(list.message);
        res.status(204).end();
    });

// get public lists
app.get("/api/open/lists", (req, res) => {
    const lists = superhero_util.get_recent_public_lists(req.body);
    res.send(lists);
})

// Endpoint to GET all matches for given filters with n results
app.post("/api/open/superheros_info/match", (req, res) => {
    match_result = superhero_util.match(req.body.filters);
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