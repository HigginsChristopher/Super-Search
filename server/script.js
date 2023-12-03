// Importing dependencies (lowDB, JOI, Fuse, bcrypt, jwt)
const low = require("lowdb");
const Joi = require("joi");
const FileSync = require("lowdb/adapters/FileSync");
const Fuse = require('fuse.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret key for email verification
const secretKey = "0b5a662e273a925daf4054db7262d4494ebf50b3ad09ca8df8e984103ee6be4a972c4c1ee7dd5cfb020d0d86cdb753f4d58086d9787c7b10ff7fb57daf50455e";

// Superhero info database and syncing it with an adapter
const info_adapter = new FileSync("../data/superhero_info.json");
const info_db = low(info_adapter)
info_db.read();

// Superhero powers database and syncing it with an adapter
const powers_adapter = new FileSync("../data/superhero_powers.json");
const powers_db = low(powers_adapter)
powers_db.read();

// Superhero lists database and syncing it with an adapter
const list_adapter = new FileSync("../data/superhero_lists.json");
const list_db = low(list_adapter)
list_db.read();
list_db.defaults({ lists: [] }).write();

// User database and syncing it with an adapter
const user_adapter = new FileSync("../data/users.json");
const user_db = low(user_adapter)
user_db.read();
user_db.defaults({ users: [] }).write();
const admin = {
    id: 0,
    username: "adminstrator",
    password: "$2b$10$iyvWWcTnX2ClglFzta0KG.gkCQDBjKFg4ifpKPtu70EM6JLQ13E12",
    email: "admin@admin.com",
    verificationToken: "",
    verified: true,
    userType: "owner",
    disabled: false
}
const existingAdmin = user_db.get("users").find({ id: 0 }).value();
if (!existingAdmin) {
    user_db.get("users").push(admin).write();
}

// ID database and syncing it with an adapter
const id_adapter = new FileSync("../data/ids.json");
const id_db = low(id_adapter)
id_db.read();
id_db.defaults({ "highestUserId": 0, "highestListId": -1, "highestReviewId": -1, "highestClaimId": -1 }).write();

// Review database and syncing it with an adapter
const review_adapter = new FileSync("../data/reviews.json");
const review_db = low(review_adapter)
review_db.read();
review_db.defaults({ reviews: [] }).write();

// DCMA claim database for lists and syncing it with an adapter
const dcma_adapter = new FileSync("../data/dcma.json");
const dcma_db = low(dcma_adapter)
dcma_db.read();
dcma_db.defaults({ claims: [] }).write();


// Function to hash password using bcrypt
const hashPassword = async (password) => {
    const saltRounds = 10;
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        throw error;
    }
};

// Function to generate email verification token
const generateVerificationToken = () => {
    return token = jwt.sign({}, secretKey, { expiresIn: '24h' });;
}

// Utility function to help with email verification
const verifyVerificationToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
};

// Function to verify email verification token
const verifyToken = async (token) => {
    try {
        const decoded = await verifyVerificationToken(token);
        return decoded;
    } catch (error) {
        return error;
    }
};

// Function to compare the user-provided password with the stored hashed password
const comparePasswords = async (userProvidedPassword, storedHashedPassword) => {
    try {
        const isPasswordMatch = await bcrypt.compare(userProvidedPassword, storedHashedPassword);
        return isPasswordMatch;
    } catch (error) {
        throw error;
    }
};

// Function to add a review to a list
const review_list = (review) => {
    let currentUser = list_db.get("lists").find({ "user_id": review.user_id, "list_id": review.list_id }).value();
    if (currentUser) {
        return new Error("Users can not review their own list.")
    }
    currentUser = review_db.get("reviews").find({ "user_id": review.user_id, "list_id": review.list_id }).value();
    if (currentUser) {
        return new Error("Users can only leave one review per list.")
    }
    const currentHighestId = id_db.get('highestReviewId').value();
    const newHighestId = currentHighestId + 1;
    id_db.set('highestReviewId', newHighestId)
        .write();
    const timestamp = Date.now();
    const newReview = { "review_id": newHighestId, "list_id": review.list_id, "user_id": review.user_id, "rating": review.rating, "comment": review.comment, "hidden": false, "created": timestamp };
    review_db.get("reviews").push(newReview).write();
    return newReview;
}

// Function to get reviews for a specific list_id
const get_reviews_list_id = (list_id) => {
    // Filtering hidden reviews
    const reviews = review_db.get("reviews")
        .filter(review => {
            return (review.list_id == list_id && !review.hidden)
        }).value();
    if (reviews.length == 0) return new Error(`No reviews for given list id.`)
    return reviews;
}

// Function to get reviews for a specific user_id
const get_reviews_user_id = (user_id) => {
    let reviews = review_db.get("reviews").value()
    reviews = reviews.filter(review => {
        return review.user_id == user_id
    });
    return reviews;
}

// Function to get all user info (user data and reviews)
const get_all_user_info = (userType) => {
    let users = structuredClone(user_db.get("users").value());
    users = users.filter(user => user.userType !== 'owner');
    if (userType === "admin") {
        users = users.filter(user => user.userType !== 'admin');
    }
    for (const user of users) {
        // Removing password and email, do not want to send back
        delete user.password;
        delete user.email;
        const reviews = get_reviews_user_id(user.id);
        user.reviews = reviews;
    }
    return users;
}

// Function to get user based on user_id
const get_user = (user_id) => {
    const user = user_db.get("users").find({ "id": user_id });
    if (user.value() === undefined) return new Error(`No users for given id.`);
    return user;
};

// Function to get review based on review_id
const get_review = (review_id) => {
    const review = review_db.get("reviews").find({ "review_id": review_id });
    if (review.value() === undefined) return new Error(`No reviews for given id.`);
    return review;
}

// Function to get reset password
const reset_password = async (user_id, password) => {
    const user = user_db.get("users").find({ "id": user_id });
    if (user.value() === undefined) return new Error(`No users for given id.`);
    const hash = await hashPassword(password);
    user.assign({ "password": hash }).write();
    return user;
}

// Function to login user
const login_user = async (user) => {
    const email = user_db.get("users").find({ "email": user.email }).value();
    if (email === undefined) return new Error(`Login was unsuccessful.`)
    const approve = await comparePasswords(user.password, email.password)
    if (email.disabled) return new Error(`Account disabled! Contact a site adminstrator.`)
    if (!approve) return new Error(`Login was unsuccessful.`)
    if (!email.verified) return new Error(`Account not verified! Check your email for verification email.`)
    return email;
}

// Function to create user
const create_user = async (user) => {
    const username = user_db.get("users").find({ "username": user.username }).value();
    if (username !== undefined) return new Error(`Username already taken`);
    const email = user_db.get("users").find({ "email": user.email }).value();
    if (email !== undefined) return new Error(`Email already taken`);
    const hash = await hashPassword(user.password);
    const verificationToken = generateVerificationToken();
    const currentHighestId = id_db.get('highestUserId').value();
    const newHighestId = currentHighestId + 1;
    id_db.set('highestUserId', newHighestId)
        .write();
    const newUser = { "id": newHighestId, "username": user.username, "password": hash, "email": user.email, "verificationToken": verificationToken, verified: false, userType: "user", disabled: false };
    user_db.get("users").push(newUser).write();
    return newUser;
}

// Function to get all DMCA claims 
const get_claims = () => {
    return dcma_db.get("claims").value();
}

// Function to get all reviews
const get_reviews = () => {
    return review_db.get("reviews").value();
}

// Function to create DMCA claim
const create_claim = (dcma) => {
    const currentHighestId = id_db.get('highestClaimId').value();
    const newHighestId = currentHighestId + 1;
    id_db.set('highestClaimId', newHighestId)
        .write();
    const newClaim = { "claim_id": newHighestId, "date_recieved": dcma.date_recieved, "date_notice_sent": dcma.date_notice_sent, "date_dispute_recieved": dcma.date_dispute_recieved, "notes": dcma.notes, "status": dcma.status, "reviews": dcma.reviews };
    dcma_db.get("claims").push(newClaim).write();
    return newClaim;
}

// Function to update DMCA claim
const update_claim = (dcma) => {
    const claim = dcma_db.get('claims').find({ "claim_id": parseInt(dcma.claim_id) });
    if (claim.value() === undefined) return new Error("Claim ID does not exists!");
    claim.assign({ "date_recieved": dcma.date_recieved, "date_notice_sent": dcma.date_notice_sent, "date_dispute_recieved": dcma.date_dispute_recieved, "notes": dcma.notes, "status": dcma.status, "reviews": dcma.reviews }).write();
    return claim.value();
}

// Function to recover account
const account_recovery = (email) => {
    const user = user_db.get("users").find({ "email": email }).value();
    if (user === undefined) return new Error("Email not found!");
    if (user.disabled) return new Error("Disabled users can not recover their account!");
    return user;
}

// Function to swap admin status
const admin_user = user_id => {
    const user = get_user(parseInt(user_id));
    if (user instanceof Error) return user.message;
    // If selected user is admin, make them user
    if (user.value().userType === "admin") {
        user.assign({ 'userType': "user" }).write();
    }
    // If selected user is user, make them admin
    else {
        user.assign({ 'userType': "admin" }).write();
    }
    return user.value();
}

// Function to swap disabled status
const disable_user = user_id => {
    const user = get_user(parseInt(user_id));
    if (user instanceof Error) return user.message;
    user.assign({ 'disabled': !(user.value().disabled) }).write();
    return user.value();
}

// Function to swap flag hidden status
const flag_review = review_id => {
    const review = get_review(parseInt(review_id));
    if (review instanceof Error) return review.message;
    review.assign({ 'hidden': !(review.value().hidden) }).write();
    return review.value();
}

// Function to verify user
const verify_user = async token => {
    const userToUpdate = user_db.get('users').find({ 'verificationToken': token });
    if (!userToUpdate.value()) return new Error(`Verification Token not found`);
    let result;
    try {
        result = await verifyToken(token);
    } catch (error) {
        result = error
    }
    if (!(result instanceof jwt.TokenExpiredError)) {
        userToUpdate.assign({ 'verified': true }).write();
        const updatedUser = userToUpdate.value();
        // User can not "verify" multiple times (no autologin on link after multiple clicks)
        userToUpdate.assign({ 'verificationToken': "" }).write();
        return updatedUser;
    } else {
        return new Error("Email verfication token expired!");
    }
}

// Function to resend email verification
const resend_verification = email => {
    return user_db.get('users').find({ 'email': email }).value();
}

// Method to get superhero info for a specified id
const get_info_id = id => {
    const info = info_db.get("content").find({ "id": id }).value();
    if (info === undefined) return new Error(`No superhero info for given ID: ${id}`)
    return info;
}

// Method to get superhero powers for a specified id
const get_powers_id = id => {
    const name = get_info_id(id).name
    const powers = structuredClone(powers_db.get("content").find({ "hero_names": name }).value());
    if (powers === undefined) return {};
    delete powers.hero_names;
    const filteredPowers = Object.fromEntries(
        Object.entries(powers).filter(([key, value]) => value === "True")
    );
    return filteredPowers;
}

// Method to get all publisher names
const get_publishers = () => {
    const data = info_db.get("content");
    const publisher_names = data.map("Publisher").value();
    const unique_publishers_set = new Set(
        publisher_names.filter(name => name.trim() !== '')
    );
    const unique_publishers_array = Array.from(unique_publishers_set);
    return unique_publishers_array;
}

// Method to get n results for a given field and match
const match = (filters) => {
    // Remove empty filters
    const nonEmptyFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== '')
    );
    const heroes = get_all_info();

    // If n is not defined, set result size to max
    const limit = nonEmptyFilters.n ? nonEmptyFilters.n : 734;
    delete nonEmptyFilters.n;

    const options = {
        keys: ['name', "Race", ['powers'], 'Publisher'],
        includeScore: true,
        findAllMatches: true,
        threshold: 0.3, 
        distance: 10, 
        ignoreFieldNorm: true
    };
    const fuse = new Fuse(heroes, options);
    const results = fuse.search(nonEmptyFilters);
    const limitedResults = results.slice(0, limit);
    return limitedResults.map(result => result.item);
}

// Method to get all private lists
const get_private_lists = (id) => {
    const lists = list_db.get("lists");
    result = lists
        .filter(list => {
            return list.user_id == id
        })
        .take(20)
        .value();

    return result;
}

// Method to get list for a given name
const get_list_name = (name, user_id) => {
    const list = list_db.get("lists").find(list => list["list-name"].toLowerCase() == name.toLowerCase() && list.user_id == user_id);
    if (list.value() === undefined) return new Error(`No list result for user with given list name: ${name}`);
    return list;
}

// Method to get list for a given id
const get_list_id = (list_id, user_id) => {
    const list = list_db.get("lists").find(list => list.user_id === user_id && list.list_id === list_id);
    if (list.value() === undefined) return new Error(`No list result for user with given list id: ${list_id}`);
    return list;
}

// Method to get details for given list and user id
const expand_list = (list_id, user_id = null) => {
    const list1 = list_db.get("lists").find(list => list.list_id === list_id).value();
    if (list1 === undefined) return new Error(`List has been recently deleted!`);
    if (list1.visibility) return list1;
    if (!list1.visibility) return list1.user_id === user_id ? list1 : new Error(`List has been recently set private!`)
}

// Method to create private lists
const create_list = (list_object) => {
    const list = get_list_name(list_object["list-name"], list_object.user_id);
    if (list instanceof Error) {
        const lists = list_db.get("lists");
        result = lists
            .filter(list => {
                return list.user_id == list_object.user_id
            })
            .value();
        if (result.length == 20) {
            return new Error("Users can only have 20 lists!");
        }
        const currentHighestId = id_db.get('highestListId').value();
        const newHighestId = currentHighestId + 1;
        id_db.set('highestListId', newHighestId)
            .write();
        const timestamp = Date.now();
        const newList = { "user_id": list_object.user_id, "list_id": newHighestId, "list-name": list_object["list-name"], "superhero_ids": list_object.superhero_ids, "description": list_object.description, "visibility": list_object.visibility, "modified": timestamp };
        list_db.get("lists").push(newList).write();
        return newList;
    }
    else {
        return new Error("List-name already exists for user!");
    }
};

// Method to save private list 
const save_list = (list_object) => {
    const list1 = get_list_id(list_object.list_id, list_object.user_id);
    const list2 = get_list_name(list_object["list-name"], list_object.user_id);
    if ((!(list1 instanceof Error) && (list2 instanceof Error)) || list1.value().list_id == list2.value().list_id) {
        const timestamp = Date.now();
        list1.assign({ "user_id": list_object.user_id, "list_id": list_object.list_id, "list-name": list_object["list-name"], "superhero_ids": list_object.superhero_ids, "description": list_object.description, "visibility": list_object.visibility, "modified": timestamp }).write();
    }
    else if (list1 instanceof Error) {
        return new Error("List with given list-ID doesn't exist!");
    }
    else {
        return new Error("List-name already exists for user!");
    }
};

// Method to delete private list
const delete_list = (user_id, list_id) => {
    const list = get_list_id(list_id, user_id);
    if (!(list instanceof Error)) {
        list_db.get("lists").remove(list.value()).write();
    }
    else {
        return list;
    }
};

// Method to get details from a given id_list
const get_details_id_list = (id_list) => {
    let results = []
    for (let i = 0; i < id_list.length; i++) {
        const hero = get_info_id(id_list[i]);
        hero.powers = get_powers_id(id_list[i]);
        hero.powers = hero.powers ? Object.keys(hero.powers).filter(power => hero.powers[power]) : [];
        results.push(hero);
    }
    return results;

}

// Method to get details from a given id
const get_details_id = (id) => {
    const hero = get_info_id(id);
    hero.powers = get_powers_id(id);
    hero.powers = hero.powers ? Object.keys(hero.powers).filter(power => hero.powers[power]) : [];
    return hero;
}

// Function to get ten most recently updated public lists
const get_recent_public_lists = () => {
    const publicLists = list_db.get('lists').filter({ visibility: true }).value();

    // Sort the public lists by timestamp in descending order
    const sortedPublicLists = publicLists.sort((a, b) => b.modified - a.modified);

    // Get the first 10 lists
    const recentPublicLists = sortedPublicLists.slice(0, 10);

    return recentPublicLists;
};

// Method to get all superhero info
const get_all_info = () => {
    const superheroes = info_db.get("content").value();
    for (const superhero of superheroes) {
        const powers = get_powers_id(superhero.id);
        superhero.powers = powers;
    }
    const flattenedHeroes = superheroes.map(hero => {
        const powersArray = hero.powers ? Object.keys(hero.powers).filter(power => hero.powers[power]) : [];
        return {
            ...hero,
            powers: powersArray,
        };
    });

    return flattenedHeroes;
};

// Method to check validity of update list details
const validate_update_list = (list) => {
    const schema = {
        user_id: Joi.number().integer().max(733).min(0).required(),
        list_id: Joi.number().integer().max(733).min(0).required(),
        ["list-name"]: Joi.string().max(100).min(1).required(),
        superhero_ids: Joi.array().items(Joi.number().integer().min(0).max(734)).min(1).unique().strict().required(),
        description: Joi.string().allow('').max(1000).min(0).strict().required(),
        visibility: Joi.boolean().required()
    }
    return Joi.validate(list, schema);
};

// Method to check validity of create list details
const validate_create_list = (list) => {
    const schema = {
        user_id: Joi.number().integer().max(733).min(0).required(),
        ["list-name"]: Joi.string().max(100).min(1).required(),
        superhero_ids: Joi.array().items(Joi.number().integer().min(0).max(734)).min(1).unique().strict().required(),
        description: Joi.string().allow('').max(1000).min(0).strict().required(),
        visibility: Joi.boolean().required()
    }
    return Joi.validate(list, schema);
};

// Method to check validity of superhero id
const validate_superhero_id = (id) => {
    const list_object = {
        id: id
    }
    const schema = {
        id: Joi.number().integer().max(733).min(0).required()
    }
    return Joi.validate(list_object, schema);
};

// Method to check validity of review, list and DMCA IDs
const validate_id = (list_id) => {
    const list_object = {
        list_id: list_id
    }
    const schema = {
        list_id: Joi.number().integer().min(0).required()
    }
    return Joi.validate(list_object, schema);
};

// Method to check validity of create DMCA details
const validate_create_dmca = (entry) => {
    const schema = {
        date_recieved: Joi.string().max(20).min(0).required(),
        date_notice_sent: Joi.string().max(20).min(0).required(),
        date_dispute_recieved: Joi.string().max(20).min(0).required(),
        notes: Joi.string().max(2000).min(0),
        status: Joi.string().max(20).min(0).required(),
        reviews: Joi.array().items(Joi.number().integer().min(0)).min(1).unique().required()
    }
    return Joi.validate(entry, schema);
}

// Method to check validity of update DMCA details
const validate_update_dcma = (entry) => {
    const schema = {
        claim_id: Joi.number().integer().min(0).required(),
        date_recieved: Joi.string().max(20).min(0).required(),
        date_notice_sent: Joi.string().max(20).min(0).required(),
        date_dispute_recieved: Joi.string().max(20).min(0).required(),
        notes: Joi.string().max(2000).min(0),
        status: Joi.string().max(20).min(0).required(),
        reviews: Joi.array().items(Joi.number().integer().min(0)).min(1).unique().required()
    }
    return Joi.validate(entry, schema);
}

// Method to check validity of create review details
const validate_create_review = (review) => {
    const schema = {
        list_id: Joi.number().integer().min(0).required(),
        user_id: Joi.number().integer().min(0).required(),
        rating: Joi.number().max(5).min(0).required(),
        comment: Joi.string().max(2000).allow(null, '').required()
    }
    return Joi.validate(review, schema);
}

// Method to check validity of create user details
const validate_create_user = (user) => {
    const schema = {
        username: Joi.string().min(0).max(60).required(),
        password: Joi.string().min(0).max(60).required(),
        email: Joi.string().min(0).max(60).required(),
    }
    return Joi.validate(user, schema);
}

// Method to check validity of lists of superhero ids
const validate_id_list = (id_list) => {
    const superhero_object = {
        id_list: id_list
    }
    const schema = {
        id_list: Joi.array().items(Joi.number().integer().max(734).min(0)).min(1).unique().required()
    }
    return Joi.validate(superhero_object, schema);
};

// Method to check validity of match details
const validate_match = (filters) => {
    const superhero_object = {
        Race: filters.Race,
        Publisher: filters.Publisher,
        name: filters.name,
        powers: filters.powers,
        n: filters.n
    }
    const schema = {
        Race: Joi.string().max(100).min(0).allow(null, '').required(),
        Publisher: Joi.string().max(100).min(0).allow(null, '').required(),
        name: Joi.string().max(100).min(0).allow(null, '').required(),
        powers: Joi.string().max(100).min(0).allow(null, '').required(),
        n: Joi.number().integer().max(734).min(1).allow(null, '').required()
    }
    return Joi.validate(superhero_object, schema);
};

// Exporting methods for usage inside server.js
module.exports = {
    get_reviews,
    get_claims,
    create_claim,
    create_user,
    resend_verification,
    get_private_lists,
    validate_match,
    validate_id_list,
    validate_id,
    validate_superhero_id,
    validate_update_list,
    validate_create_list,
    create_list,
    save_list,
    get_list_id,
    delete_list,
    get_details_id_list,
    get_details_id,
    get_all_info,
    get_info_id,
    get_powers_id,
    get_publishers,
    match,
    hashPassword,
    login_user,
    create_user,
    verify_user,
    get_recent_public_lists,
    get_reviews_list_id,
    review_list,
    get_user,
    get_all_user_info,
    disable_user,
    flag_review,
    admin_user,
    update_claim,
    account_recovery,
    reset_password,
    validate_create_dmca,
    validate_update_dcma,
    validate_create_review,
    validate_create_user,
    expand_list
};