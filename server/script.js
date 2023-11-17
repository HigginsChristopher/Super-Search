// Importing dependencies (lowDB, JOI, and sanitize-HTML)
const low = require("lowdb");
const Joi = require("joi");
const FileSync = require("lowdb/adapters/FileSync");
const sanitize_html = require("sanitize-html");

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

// ID database for lists and syncing it with an adapter
const id_adapter = new FileSync("../data/ids.json");
const id_db = low(id_adapter)
id_db.read();

// Default if ids.json doesn't exists
id_db.defaults({ "highestId": -1 }).write();

// Method to get all superhero info
const get_all_info = () => info_db.get("content").value();

// Method to get superhero info for a specified id
const get_info = id => {
    const info = info_db.get("content").find({ "id": id }).value();
    // Return error if no result for given id
    if (info === undefined) return new Error(`No superhero info for given ID: ${id}`)
    return info;
}

// Method to get superhero id for a specified name
const get_id = name => {
    const info = info_db.get("content").find({ "name": name }).value();
    // Return error if no result for given name
    if (info === undefined) return new Error(`No superhero info for given name: ${name}`)
    return info.id;
}

// Method to get all superhero powers
const get_all_powers = () => powers_db.get("content").value();

// Method to get superhero powers for a specified id
const get_powers = id => {
    const name = get_info(id).name
    const powers = powers_db.get("content").find({ "hero_names": name }).value();
    // Return error if no result for given name
    if (powers === undefined) return new Error(`No powers for ${name} - ID: ${id}`);
    return powers;
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
const match = (field, match, n = 734) => {
    let match_result = [];
    // Matching for power field is unique (user must enter the correct power name, case-insensitive)
    if (field === "power") {
        // Capitalizing all word first letters and lower casing rest
        match = capitalize_words(match);
        const superhero_info = powers_db.get("content");
        for (const superhero of superhero_info) {
            // If one superhero doesn't have power, return no power error
            if (superhero[match] === undefined) {
                return new Error(`No power called '${match}'!`);
            }
            // If power is true and there can be more results
            else if (superhero[match] === "True" && match_result.length < n) {
                const id = get_id(superhero.hero_names)
                // If result is not instance of error, push it to results
                if (!(id instanceof Error)) {
                    match_result.push(id);
                }
            }
        }
    }
    // Matching for other fields
    else {
        const superhero_info = info_db.get("content");
        const lower_case_field = field.toLowerCase();
        const lower_case_match = match.toLowerCase();
        // Filter results for given field and name taking only n ids 
        match_result = superhero_info
            .filter(item => {
                const fieldValue = String(item[field]);
                return fieldValue.toLowerCase().includes(lower_case_match);
            })
            .take(n)
            .map("id")
            .value();
        // If result is empty, no result for given field and match
        if (match_result.length === 0) return new Error(`No results for field: '${field}' and match: '${match}'!`);
    }
    return match_result;
}

// Method to get all lists
const get_all_lists = () => list_db.get("lists").value();


// Method to get list for a given name
const get_list_name = (name) => {
    const list = list_db.get("lists").find(list => list["list-name"].toLowerCase() == name.toLowerCase());
    // Return error if no result for given name
    if (list.value() === undefined) return new Error(`No list result for given name: ${name}`);
    return list;
}

// Method to get list for a given id
const get_list_id = (id) => {
    const list = list_db.get("lists").find(list => list.id == id);
    // Return error if no result for given id
    if (list.value() === undefined) return new Error(`No list result for given ID: ${id}`);
    return list;
}

// Method to create list with a given name and id_list
const create_list = (name, id_list, description, visibility) => {
    // Check if list already exists
    const list = get_list_name(name);
    // List doesn't exist, create list
    if (list instanceof Error) {
        // Get new highest id and update id database
        const currentHighestId = id_db.get('highestId').value();
        const newHighestId = currentHighestId + 1;
        id_db.set('highestId', newHighestId)
            .write();
        // Create list and write to database
        const newList = { "id": newHighestId, "list-name": name, "superhero_ids": id_list, "description": description, "visibility": visibility };
        list_db.get("lists").push(newList).write();
        return newList;
    }
    // List exists, return error
    else {
        return new Error("List-name already exists!");
    }
};

// Method to save list with a given id and id_list
const save_list = (list_object) => {
    // Check if list already exists
    const list = get_list_id(list_object.id);
    // List exists, save list
    if (!(list instanceof Error)) {
        list.assign({ "list-name": list_object["list-name"], "superhero_ids": list_object.superhero_ids, "description": list_object.description, "visibility": list_object.visibility}).write();
    }
    // List with given ID doesn't exist, return error
    else {
        return new Error("List with given ID doesn't exist!");
    }
};

// Method to get list ids for a given name
const get_list_ids = (name) => {
    // Check if list already exists
    const list = get_list_name(name);
    // List exists, return ids
    if (!(list instanceof Error)) {
        return list.value()["superhero_ids"];
    }
    // List name doesn't exist, return error
    else {
        return new Error("List-name doesn't exist!");
    }
};

// Method to delete list for a given id
const delete_list = (id) => {
    // Check if list already exists
    const list = get_list_id(id);
    // List exists, remove list
    if (!(list instanceof Error)) {
        list_db.get("lists").remove(list.value()).write();
    }
    // List with given ID doesn't exist, return error
    else {
        return new Error("List with given ID doesn't exist!");
    }
};

// Method to get details from a given id_list
const get_details_from_list = (id_list) => {
    // No detail duplicates (set)
    let results = new Set();
    for (let i = 0; i < id_list.length; i++) {
        let info = get_info(id_list[i]);
        info.powers = get_powers(id_list[i]);
        results.add(info);
    }
    // Convert back to array
    return Array.from(results);
}

// Method to check validity of update list details
const validate_update_list = (list) => {
    const schema = {
        id: Joi.number().integer().max(733).min(0).required(),
        ["list-name"]: Joi.string().max(100).min(1).required(),
        superhero_ids: Joi.array().items(Joi.number().integer().min(1).max(734)).strict().required(),
        description: Joi.string().allow('').max(1000).min(0).strict().required(),
        visibility: Joi.boolean().required()
    }
    return Joi.validate(list, schema);
};

// Method to check validity of create list details
const validate_create_list = (list) => {
    const schema = {
        ["list-name"]: Joi.string().max(100).min(1).required(),
        superhero_ids: Joi.array().items(Joi.number().integer().min(1).max(734)).strict().required(),
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
    const superhero_object = {
        name: name
    }
    const schema = {
        name: Joi.string().max(100).min(1).required()
    }
    return Joi.validate(superhero_object, schema);
};

// Method to check validity of id_lists inside list
const validate_id_list = (id_list) => {
    const superhero_object = {
        id_list: id_list
    }
    const schema = {
        id_list: Joi.array().items(Joi.number().integer()).max(734).min(1).required()
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

// Method to capitalize first letter of every word in a given sentence and make all other characters lowercase
const capitalize_words = (str) => {
    const words = str.trim().split(/\s+/);
    const capitalized_words = words.map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    return capitalized_words.join(' ');
};

// Exporting methods for usage inside server.js
module.exports = {
    get_all_lists,
    sanitize_user_input,
    validate_match,
    validate_id_list,
    validate_id,
    validate_update_list,
    validate_create_list,
    validate_name,
    create_list,
    save_list,
    get_list_ids,
    get_list_id,
    delete_list,
    get_details_from_list,
    get_all_info,
    get_info,
    get_all_powers,
    get_powers,
    get_publishers,
    match
};