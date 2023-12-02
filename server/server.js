// Importing dependencies (express, script.js and jwt)
const express = require("express");
const superhero_util = require('./script.js');
const jwt = require('jsonwebtoken');

// Setting up port and express application
const port = process.env.PORT || 3000;
const app = express();

// Secret key for JWT
const secretKey = "c25a959c1565f04b62c983c9e7413bff2bf873db9a1460a2e91c97f14c092cd982c26a8dcb8ff018b785e77214056efd55425ae4107e1fb6836e35649aeab2b8";

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    let token = req.header('Authorization');
    // No token
    if (!token) {
        return res.status(401).send({ message: 'Unauthorized' });
    }
    token = token.split(' ')[1]
    jwt.verify(token, secretKey, (err, user) => {
        // Token expired
        if (err) {
            return res.status(403).send({ message: 'Forbidden' });
        }
        // User authenticated
        req.user = user;
        next();
    });
};

// Middleware for list expansion (check if user is authenticated to get their id)
const checkUser = (req, res, next) => {
    let token = req.header('Authorization');
    if (!token) {
        next();
    }
    else {
        token = token.split(' ')[1]
    }
    jwt.verify(token, secretKey, (err, user) => {
        // Token expired
        if (err) {
            next();
        }
        // User authenticated
        req.user = user;
        next();
    });
};

// Middleware to authenticate admin
const checkAdmin = (req, res, next) => {
    if (req.user && (req.user.userType === "admin" || req.user.userType === "owner")) {
        // User is an admin
        return next();
    } else {
        // User is not an admin
        return res.status(403).send({ message: 'Forbidden - Admins only' });
    }
};

// Middleware to authenticate owner
const checkOwner = (req, res, next) => {
    if (req.user && (req.user.userType === "owner")) {
        // User is an owner
        return next();
    } else {
        // User is not an owner
        return res.status(403).send({ message: 'Forbidden - Owner only' });
    }
};

// MIDDLEWARE
// Middleware to make data in body and response is in JSON
app.use(express.json());

// ENDPOINTS
// Endpoint to POST (create) DCMA claims ( accessible by authenticated admins)
app.post('/api/admin/dcma/', authenticateToken, checkAdmin, async (req, res) => {
    const { error } = superhero_util.validate_create_dmca(req.body.dcma);
    if (error) return res.status(400).send({ message: error.details[0].message });
    const claim = superhero_util.create_claim(req.body.dcma);
    if (claim instanceof Error) return res.status(404).send({ message: list.message });
    res.send({ claim: claim });
});

// Endpoint to POST (update) DCMA claim based on ID (accessible by authenticated admins) 
app.post('/api/admin/dcma/:id', authenticateToken, checkAdmin, async (req, res) => {
    req.body.dcma.claim_id = req.params.id;
    const { error } = superhero_util.validate_update_dcma(req.body.dcma);
    if (error) return res.status(400).send({ message: error.details[0].message });
    const claim = superhero_util.update_claim(req.body.dcma);
    if (claim instanceof Error) return res.status(404).send({ message: list.message });
    res.send({ claim: claim });
});

// Endpoint to GET all DCMA claims (accessible by authenticated admins) 
app.get('/api/admin/dcma/', authenticateToken, checkAdmin, async (req, res) => {
    const claims = superhero_util.get_claims();
    res.send({ claims: claims });
});

// Endpoint to GET all reviews (accessible by authenticated admins) 
app.get('/api/admin/reviews/', authenticateToken, checkAdmin, async (req, res) => {
    const reviews = superhero_util.get_reviews();
    res.send({ reviews: reviews });
});

// Endpoint to POST (update) admin status (accessible by authenticated owner) 
app.post('/api/owner/users/admin/:id', authenticateToken, checkOwner, async (req, res) => {
    const { error } = superhero_util.validate_id(req.params.id);
    if (error) return res.status(400).send({ message: error.details[0].message });
    const user = superhero_util.admin_user(req.params.id);
    if (user instanceof Error) return res.status(404).send({ message: user.message });
    res.send({ user: user });
});

// Endpoint to GET all user info user data (accessible by authenticated admin) 
app.get('/api/admin/users/', authenticateToken, checkAdmin, async (req, res) => {
    const users = superhero_util.get_all_user_info(req.user.userType);
    res.send({ users: users });
});

// Endpoint to POST (update) disable status (accessible by authenticated admin) 
app.post('/api/admin/users/disable/:id', authenticateToken, checkAdmin, async (req, res) => {
    const { error } = superhero_util.validate_id(req.params.id);
    if (error) return res.status(400).send({ message: error.details[0].message });
    const user = superhero_util.disable_user(req.params.id);
    if (user instanceof Error) return res.status(404).send({ message: user.message });
    res.send({ user: user });
});

// Endpoint to POST (update) flag of given review (accessible by authenticated admin) 
app.post('/api/admin/reviews/flag/:id', authenticateToken, checkAdmin, async (req, res) => {
    const { error } = superhero_util.validate_id(req.params.id);
    if (error) return res.status(400).send({ message: error.details[0].message });
    const review = superhero_util.flag_review(req.params.id);
    if (review instanceof Error) return res.status(404).send({ message: review.message });
    res.send({ review: review });
});

// Endpoint to GET reviews for a given list (accessible by all users)
app.get('/api/open/reviews/:id', (req, res) => {
    const { error } = superhero_util.validate_id(req.params.id);
    if (error) return res.status(400).send({ message: error.details[0].message });
    const reviews = superhero_util.get_reviews_list_id(req.params.id)
    if (reviews instanceof Error) return res.send({ message: reviews.message });
    res.send({ reviews: reviews });
});

// Endpoint to POST (create) a review on a list (accesible by authenticated users)
app.post('/api/secure/lists/reviews/', authenticateToken, (req, res) => {
    req.body.review.user_id = req.user.user_id;
    const { error } = superhero_util.validate_create_review(req.body.review);
    if (error) return res.status(400).send({ message: { message: error.details[0].message } });
    const review = superhero_util.review_list(req.body.review);
    if (review instanceof Error) return res.send({ message: review.message });
    res.send({ review: review });
});

// Endpoint to allow user login (accessible by all users)
app.post('/api/open/users/login', async (req, res) => {
    const user = await superhero_util.login_user(req.body.user);
    if (!(user instanceof Error)) {
        const token = jwt.sign({ user_id: user.id, email: user.email, username: user.username, userType: user.userType }, secretKey, { expiresIn: '1h' });
        res.send({ token: token });
    } else {
        res.status(401).send({ message: user.message });
    }
});

// Endpoint to allow user registration (accessible by all users)
app.post('/api/open/users/register', async (req, res) => {
    const { error } = superhero_util.validate_create_user(req.body.user);
    if (error) return res.status(400).send({ message: error.details[0].message });
    const user = await superhero_util.create_user(req.body.user);
    if (!(user instanceof Error)) {
        const return_user = {
            email: user.email,
            verificationToken: user.verificationToken
        }
        res.send({ user: return_user });
    } else {
        res.status(401).send({ message: user.message });
    }
});

// Endpoint to allow user account recovery for forgotten password (accessible by all users)
app.post('/api/open/users/recovery', async (req, res) => {
    const user = superhero_util.account_recovery(req.body.email);
    if (!(user instanceof Error)) {
        const token = jwt.sign({ user_id: user.id, email: user.email, username: user.username, userType: user.userType }, secretKey, { expiresIn: '1h' });
        res.send({ token: token });
    } else {
        res.status(401).send({ message: user.message });
    }
});

// Endpoint to allow users to reset password (accesible by authenticated users)
app.post('/api/secure/users/password/', authenticateToken, async (req, res) => {
    const user = await superhero_util.reset_password(req.user.user_id, req.body.password);
    if (!(user instanceof Error)) {
        res.send({ message: "Password succesfully changed!" });
    } else {
        res.status(401).send({ message: user.message });
    }
});

// Endpoint to verify users email (accessible by all users)
app.get('/api/open/users/verify', async (req, res) => {
    const user = await superhero_util.verify_user(req.query.token);
    if (!(user instanceof Error)) {
        const token = jwt.sign({ user_id: user.id, email: user.email, username: user.username, userType: user.userType }, secretKey, { expiresIn: '1h' });
        res.send({ token: token });
    } else {
        res.status(400).send({ message: user.message });
    }
});

// Endpoint to resend email verification (accessible by all users)
app.post('/api/open/users/verify/resend/', async (req, res) => {
    const user = superhero_util.resend_verification(req.body.email);
    if (user !== undefined) {
        const return_user = {
            email: user.email,
            verificationToken: user.verificationToken
        }
        res.send({ user: return_user });
    } else {
        res.status(400).send({ message: "Email to verify does not exist!" });
    }
});

// Endpoint to GET username for given user id (accessible by all users)
app.get("/api/open/users/:id", (req, res) => {
    const { error } = superhero_util.validate_id(req.params.id);
    if (error) return res.status(400).send({ message: error.details[0].message });
    const id = Number(req.params.id);
    const user = superhero_util.get_user(id).value();
    if (user instanceof Error) return res.status(404).send({ message: user.message });
    res.send({ username: user.username });
});

// Route to handle /api/secure/lists 
app.route("/api/secure/lists/")
    // Endpoint to GET private lists (accesible by authenticated users)
    .get(authenticateToken, (req, res) => {
        const lists = superhero_util.get_private_lists(req.user.user_id);
        res.send({ lists: lists });
    })
    // Endpoint to POST (create) private lists (accesible by authenticated users)
    .post(authenticateToken, (req, res) => {
        req.body.list.user_id = req.user.user_id;
        const { error } = superhero_util.validate_create_list(req.body.list);
        if (error) return res.status(400).send({ message: error.details[0].message });
        const list = superhero_util.create_list(req.body.list);
        if (list instanceof Error) return res.status(404).send({ message: list.message });
        res.send({ list: list });
    })

// Endpoint to GET list details for given list id (accessible by all users)
app.get("/api/open/lists/:id", checkUser, (req, res) => {
    const { error } = superhero_util.validate_id(req.params.id);
    if (error) return res.status(400).send({ message: error.details[0].message });
    let list
    if (req.user) {
        list = superhero_util.expand_list(parseInt(req.params.id), req.user.user_id);
    }
    else {
        list = superhero_util.expand_list(parseInt(req.params.id));
    }
    if (list instanceof Error) return res.status(404).send({ message: list.message });
    res.send({ list: list });
})

// Route to handle /api/secure/lists/:id
app.route("/api/secure/lists/:id")
    // Endpoint to POST (update) private lists (accesible by authenticated users)
    .post(authenticateToken, (req, res) => {
        req.body.list.user_id = req.user.user_id;
        const { error } = superhero_util.validate_update_list(req.body.list);
        if (error) return res.status(400).send({ message: error.details[0].message });
        const list = superhero_util.save_list(req.body.list)
        if (list instanceof Error) return res.status(404).send({ message: list.message });
        res.send({ list: list });
    })
    // Endpoint to DELETE private lists (accesible by authenticated users)
    .delete(authenticateToken, (req, res) => {
        const { error } = superhero_util.validate_id(req.params.id);
        if (error) return res.status(400).send({ message: error.details[0].message });
        const list = superhero_util.delete_list(req.user.user_id, parseInt(req.params.id));
        if (list instanceof Error) return res.status(404).send({ message: list.message });
        res.status(204).end();
    });

// Endpoint to GET public lists (accessible by all users)
app.get("/api/open/lists", (req, res) => {
    const lists = superhero_util.get_recent_public_lists();
    res.send({ lists: lists });
})

// Endpoint to GET matches for given filters (accessible by all users)
app.post("/api/open/superheros_info/match", (req, res) => {
    const { error } = superhero_util.validate_match(req.body.filters);
    if (error) return res.status(400).send({ message: error.details[0].message });
    match_result = superhero_util.match(req.body.filters);
    res.send({ match: match_result });
});

// Endpoint to GET all details for a list of superheros (accessible by all users)
app.get("/api/open/superheros_info", (req, res) => {
    let id_list;
    try {
        id_list = JSON.parse(req.query.id_list);
    } catch (ignored) { }
    const { error } = superhero_util.validate_id_list(id_list);
    if (error) return res.status(400).send({ message: error.details[0].message });
    const heroes = superhero_util.get_details_id_list(id_list);
    if (heroes instanceof Error) return res.status(404).send({ message: heroes.message });
    res.send({ heroes: heroes });
})

// Endpoint to GET superhero details for given id (accessible by all users)
app.get("/api/open/superheros_info/:id", (req, res) => {
    const id = Number(req.params.id);
    const { error } = superhero_util.validate_superhero_id(id);
    if (error) return res.status(400).send({ message: error.details[0].message });
    const superhero_info = superhero_util.get_details_id(id);
    if (superhero_info instanceof Error) return res.status(404).send({ message: superhero_info.message });
    res.send({ superhero: superhero_info });
});

// Listening to application and displaying port number
app.listen(port, () => console.log(`Listening on port ${port}...`));