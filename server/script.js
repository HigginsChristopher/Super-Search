const { result } = require("lodash");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const Joi = require("joi");

const info_adapter = new FileSync("../data/superhero_info.json");
const info_db = low(info_adapter)
info_db.read();

const powers_adapter = new FileSync("../data/superhero_powers.json");
const powers_db = low(powers_adapter)
powers_db.read();

const list_adapter = new FileSync("../data/superhero_lists.json");
const list_db = low(list_adapter)
list_db.read();

list_db.defaults({ lists: [] }).write();

const get_all_info = () => info_db.get("content").value();

const get_info = id => {
    const info = info_db.get("content").find({ "id": id }).value();
    if (info === undefined) return new Error(`No results for given ID: ${id}`)
    return info;
}

const get_all_powers = () => powers_db.get("content").value();

const get_powers = id => {
    const powers = powers_db.get("content").find({ "hero_names": get_info(id).name }).value();
    if (powers === undefined) return new Error(`No results for given ID: ${id}`);
    return powers;
}

const get_publishers = () => {
    const data = info_db.get("content");
    const publisher_names = data.map("Publisher").value();
    const unique_publishers_set = new Set(
        publisher_names.filter(name => name.trim() !== '')
    );
    const unique_publishers_array = Array.from(unique_publishers_set);
    return unique_publishers_array;
}

const match = (field, match, n = 1) => {
    let superhero_info = info_db.get("content");
    const lower_case_field = field.toLowerCase();
    const lower_case_match = match.toLowerCase();
    const match_result = superhero_info
        .filter(item => (item[lower_case_field] && String(item[lower_case_field]).toLowerCase().includes(lower_case_match)))
        .take(n)
        .map("id")
        .value();
    if (match_result.length === 0) return new Error(`No results for field: '${field}' and match: '${match}'!`);
    return match_result;
}

const get_list = (name) => {
    const list = list_db.get("lists").find(list => list["list-name"].toLowerCase() === name.toLowerCase());
    if (list.value() === undefined) return new Error(`No results for given name: ${name}`);
    return list;
}

const create_list = (name, id_list) => {
    const list = get_list(name);
    if (list instanceof Error) {
        const newList = { "list-name": name, "superhero_ids": id_list };
        list_db.get("lists").push(newList).write();
    }
    else {
        return new Error("List-name already exists!");
    }
};

const save_list = (name, id_list) => {
    const list = get_list(name);
    if (!(list instanceof Error)) {
        list.assign({ "superhero_ids": id_list }).write();
    }
    else {
        return new Error("List-name doesn't exist!");
    }
};

const get_list_ids = (name) => {
    const list = get_list(name);
    if (!(list instanceof Error)) {
        return list.value()["superhero_ids"];
    }
    else {
        return new Error("List-name doesn't exist!");
    }
};

const delete_list = (name) => {
    const list = get_list(name);
    if (!(list instanceof Error)) {
        list_db.get("lists").remove(list.value()).write();
    }
    else {
        return new Error("List-name doesn't exist!");
    }
};

const get_details_from_list = (id_list) => {
    let results = new Set();
    for (let i = 0; i < id_list.length; i++) {
        console.log(id_list[i]);
        let info = get_info(id_list[i]);
        info.powers = get_powers(id_list[i]);
        results.add(info);
    }
    return Array.from(results);
}

const validate_list = (list) => {
    const schema = {
        name: Joi.string().max(100).min(1).required(),
        id_list: Joi.array().items(Joi.number().integer()).max(734).min(1).required()
    }
    return Joi.validate(list, schema);
};

const validate_id = (id) => {
    const superhero_object = {
        superhero_id: id
    }
    const schema = {
        superhero_id: Joi.number().integer().max(733).min(0).required()
    }
    return Joi.validate(superhero_object, schema);
};

const validate_name = (name) => {
    const superhero_object = {
        name: name
    }
    const schema = {
        name: Joi.string().max(100).min(2).required()
    }
    return Joi.validate(superhero_object, schema);
};

const validate_id_list = (id_list) => {
    const superhero_object = {
        id_list: id_list
    }
    const schema = {
        id_list: Joi.array().items(Joi.number().integer()).max(734).min(1).required()
    }
    return Joi.validate(superhero_object, schema);
};

const validate_match = (field,match,n) => {
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



// console.log(get_all_info());
// console.log(get_info(0));
// console.log(get_powers(0));
// console.log(get_publishers());
// console.log(match("name", "spider",2));
// create_list("TEST1", [579, 580])
// create_list("test1", [579,580])
// let ids = get_list_ids("test1")
// console.log(ids);
// save_list("test1", [579])
// ids = get_list_ids("test1")
// console.log(ids);
// delete_list("test1");
// console.log(get_details_from_list(ids));

module.exports = {
    validate_match,
    validate_id_list,
    validate_id,
    validate_list,
    validate_name,
    create_list,
    save_list,
    get_list_ids,
    get_list,
    delete_list,
    get_details_from_list,
    get_all_info,
    get_info,
    get_all_powers,
    get_powers,
    get_publishers,
    match
};