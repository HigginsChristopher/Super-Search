// Importing dependencies (lowDB, JOI, and sanitize-HTML)
const low = require("lowdb");
const Joi = require("joi");
const FileSync = require("lowdb/adapters/FileSync");
const sanitize_html = require("sanitize-html");
const crypto = require("crypto");
const Fuse = require('fuse.js');
const bcrypt = require('bcrypt');

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
// Default if superhero_lists.json doesn't exists
list_db.defaults({ lists: [] }).write();

// Superhero lists database and syncing it with an adapter
const user_adapter = new FileSync("../data/users.json");
const user_db = low(user_adapter)
user_db.read();
user_db.defaults({ users: [] }).write();

// ID database for lists and syncing it with an adapter
const id_adapter = new FileSync("../data/ids.json");
const id_db = low(id_adapter)
id_db.read();

// Default if ids.json doesn't exists
id_db.defaults({ "highestUserId": -1, "highestListId": -1 }).write();

// Method to sanitize objects contents, remove HTML, JS and CSS elements #EXTRA LAYER
const sanitize_user_input = (obj) => {
    if (typeof obj === 'object') {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'string') {
                    obj[key] = sanitize_html(decodeURIComponent(obj[key]));
                } else if (typeof obj[key] === 'object') {
                    sanitize_user_input(obj[key]);
                }
            }
        }
    }
};

// Salt rounds for bcrypt
const saltRounds = 10;
// Hash the password before storing it in the database
const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        throw error;
    }
};

// Compare the user-provided password with the stored hashed password
const comparePasswords = async (userProvidedPassword, storedHashedPassword) => {
    try {
        const isPasswordMatch = await bcrypt.compare(userProvidedPassword, storedHashedPassword);
        return isPasswordMatch;
    } catch (error) {
        throw error;
    }
};

const get_user = async (user) => {
    const info = user_db.get("users").find({ "email": user.email }).value();
    if (info === undefined) return new Error(`No users for given email.`)
    const approve = await comparePasswords(user.password, info.password)
    // Return error if no result for given id
    if (!approve) return new Error(`Wrong password.`)
    if (!info.activated) return new Error(`Account not verified! Check your email for verification email.`)
    return info;
}

const create_user = async (user) => {
    const username = user_db.get("users").find({ "username": user.username }).value();
    if (username !== undefined) return new Error(`Username already taken`);
    const email = user_db.get("users").find({ "email": user.email }).value();
    if (email !== undefined) return new Error(`Email already taken`);
    const hash = await hashPassword(user.password);
    const verificationToken = crypto.randomBytes(20).toString('hex');
    // Get new highest id and update id database
    const currentHighestId = id_db.get('highestUserId').value();
    const newHighestId = currentHighestId + 1;
    id_db.set('highestUserId', newHighestId)
        .write();
    const newUser = { "id": newHighestId, "username": user.username, "password": hash, "email": user.email, "verificationToken": verificationToken, activated: false };
    user_db.get("users").push(newUser).write();
    return newUser;
}

const verify_user = token => {
    const userToUpdate = user_db.get('users').find({ 'verificationToken': token });
    if (!userToUpdate.value()) return new Error(`Verification Token not found`);
    userToUpdate.assign({ 'activated': true }).write();
    const updatedUser = userToUpdate.value();
    return updatedUser;
}

// Method to get superhero info for a specified id
const get_info_id = id => {
    const info = info_db.get("content").find({ "id": id }).value();
    // Return error if no result for given id
    if (info === undefined) return new Error(`No superhero info for given ID: ${id}`)
    return info;
}

// Method to get superhero powers for a specified id
const get_powers_id = id => {
    const name = get_info_id(id).name
    const powers = structuredClone(powers_db.get("content").find({ "hero_names": name }).value());
    // Return error if no result for given name
    if (powers === undefined) return {};
    delete powers.hero_names;
    // Filter out powers that are not true
    const filteredPowers = Object.fromEntries(
        Object.entries(powers).filter(([key, value]) => value === "True")
    );
    return filteredPowers;
}

// Method to get all publisher names
const get_publishers = () => {
    const data = info_db.get("content");
    const publisher_names = data.map("Publisher").value();
    // Making publishers unique and not empty using a set with a filter
    const unique_publishers_set = new Set(
        publisher_names.filter(name => name.trim() !== '')
    );
    // Converting set back to array
    const unique_publishers_array = Array.from(unique_publishers_set);
    return unique_publishers_array;
}

// Method to get n results for a given field and match
const match = (filters, limit = 734) => {
    // Remove properties with empty values
    const nonEmptyFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== '')
    );
    const heroes = get_all_info();

    const options = {
        keys: ['name', "Race", ['powers'], 'Publisher'],
        includeScore: true,
        findAllMatches: true,
    };

    const fuse = new Fuse(heroes, options);
    const results = fuse.search(nonEmptyFilters);
    const limitedResults = results.slice(0, limit);
    return limitedResults.map(result => result.item);
}

// Method to get all lists
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
    // Return error if no result for given name
    if (list.value() === undefined) return new Error(`No list result for user with given list name: ${name}`);
    return list;
}

// Method to get list for a given id
const get_list_id = (list_id, user_id) => {
    const list = list_db.get("lists").find(list => list.list_id === list_id && list.user_id === user_id);
    // Return error if no result for given id
    if (list.value() === undefined) return new Error(`No list result for user with given list id: ${list_id}`);
    return list;
}

// Method to create list with a given name and id_list
const create_list = (list_object) => {
    // Check if list already exists
    const list = get_list_name(list_object["list-name"], list_object.user_id);
    // List doesn't exist, create list
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
        // Create list and write to database
        const newList = { "user_id": list_object.user_id, "list_id": newHighestId, "list-name": list_object["list-name"], "superhero_ids": list_object.id_list, "description": list_object.description, "visibility": list_object.visibility, "modified": timestamp };
        list_db.get("lists").push(newList).write();
        return newList;
    }
    // List exists, return error
    else {
        return new Error("List-name already exists for user!");
    }
};

// Method to save list with a given id and id_list
const save_list = (list_object) => {
    // Check if list already exists
    const list = get_list_id(list_object.list_id, list_object.user_id);
    // List exists, save list
    if (!(list instanceof Error)) {
        const timestamp = Date.now();
        list.assign({ "user_id": list_object.user_id, "list_object": list_object.list_id, "list-name": list_object["list-name"], "superhero_ids": list_object.superhero_ids, "description": list_object.description, "visibility": list_object.visibility, "modified": timestamp }).write();
    }
    // List with given ID doesn't exist, return error
    else {
        return new Error("List with given list-ID doesn't exist!");
    }
};

// Method to delete list for a given id
const delete_list = (user_id, name) => {
    // Check if list already exists
    const list = get_list_name(name, user_id);
    // List exists, remove list
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
    // Convert back to array
    return results;

}

// Method to get details from a given id
const get_details_id = (id) => {
    const hero = get_info_id(id);
    hero.powers = get_powers_id(id);
    hero.powers = hero.powers ? Object.keys(hero.powers).filter(power => hero.powers[power]) : [];
    return hero;
}

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
        superhero_ids: Joi.array().items(Joi.number().integer().min(0).max(734)).unique().strict().required(),
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
        superhero_ids: Joi.array().items(Joi.number().integer().min(0).max(734)).unique().strict().required(),
        description: Joi.string().allow('').max(1000).min(0).strict().required(),
        visibility: Joi.boolean().required()
    }
    return Joi.validate(list, schema);
};

// Method to check validity of superhero and list ids
const validate_id = (id) => {
    const superhero_object = {
        superhero_id: id
    }
    const schema = {
        superhero_id: Joi.number().integer().max(733).min(0).required()
    }
    return Joi.validate(superhero_object, schema);
};

// Method to check validity of list names
const validate_name = (name) => {
    const list_object = {
        name: name
    }
    const schema = {
        name: Joi.string().max(100).min(1).required()
    }
    return Joi.validate(list_object, schema);
};

// Method to check validity of id_lists inside list
const validate_id_list = (id_list) => {
    const superhero_object = {
        id_list: id_list
    }
    const schema = {
        id_list: Joi.array().items(Joi.number().integer()).max(734).min(0).unique().required()
    }
    return Joi.validate(superhero_object, schema);
};

// Method to check validity of match details
const validate_match = (field, match, n) => {
    const superhero_object = {
        field: field,
        match: match,
        n: n
    }
    const schema = {
        field: Joi.string().max(100).min(0).required(),
        match: Joi.string().max(100).min(0).required(),
        n: Joi.number().integer().max(734).min(1)
    }
    return Joi.validate(superhero_object, schema);
};

// Exporting methods for usage inside server.js
module.exports = {
    create_user,
    get_private_lists,
    sanitize_user_input,
    validate_match,
    validate_id_list,
    validate_id,
    validate_update_list,
    validate_create_list,
    validate_name,
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
    get_user,
    create_user,
    verify_user,
    get_recent_public_lists
};