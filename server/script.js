const { result } = require("lodash");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

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

const get_info = id => info_db.get("content").find({ "id": parseInt(id) }).value();

const get_all_powers = () => powers_db.get("content").value();

const get_powers = id => powers_db.get("content").find({ "hero_names": get_info(parseInt(id)).name }).value();

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
    return superhero_info
        .filter(item => item[lower_case_field].toLowerCase().includes(lower_case_match))
        .take(parseInt(n))
        .map("id")
        .value();

}

const get_list = (name) => {
    return list_db.get("lists").find(list => list["list-name"].toLowerCase() === name.toLowerCase());
}

const create_list = (name, id_list) => {
    const list = get_list(name).value();
    if (!list) {
        const newList = { "list-name": name, "superhero_ids": id_list };
        list_db.get("lists").push(newList).write();
    }
    else {
        console.log("List-name already exists!");
        return new Error("List-name already exists!");
    }
};

const save_list = (name, id_list) => {
    const list = get_list(name);
    if (list.value()) {
        list.assign({ "superhero_ids": id_list }).write();
    }
    else {
        console.log("List-name doesn't exist!");
        return new Error("List-name doesn't exist!");
    }
};

const get_list_ids = (name) => {
    const list = get_list(name).value();
    if (list) {
        return list["superhero_ids"];
    }
    else {
        console.log("List-name doesn't exist!");
        return new Error("List-name doesn't exist!");
    }
};

const delete_list = (name) => {
    const list = get_list(name).value();
    if (list) {
        list_db.get("lists").remove(list).write();
    }
    else {
        console.log("List-name doesn't exist!");
        return new Error("List-name doesn't exist!");
    }
};

const get_details_from_list = (id_list) => {
    let results = [];
    for (let i = 0; i < id_list.length; i++) {
        let info = get_info(id_list[i]);
        info.powers = get_powers(id_list[i]);
        results.push(info);
    }
    return results;
}


// console.log(get_all_info());
// console.log(get_info(0));
// console.log(get_powers(0));
// console.log(get_publishers());
// console.log(match("name", "spider",2));
create_list("TEST1", [579, 580])
// create_list("test1", [579,580])
let ids = get_list_ids("test1")
console.log(ids);
// save_list("test1", [579])
// ids = get_list_ids("test1")
// console.log(ids);
// delete_list("test1");
console.log(get_details_from_list(ids));

module.exports = {
    create_list,
    save_list,
    get_list_ids,
    delete_list,
    get_details_from_list,
    get_all_info,
    get_info,
    get_all_powers,
    get_powers,
    get_publishers,
    match
};