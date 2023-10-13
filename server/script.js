const { result } = require("lodash");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const info_adapter = new FileSync("../data/superhero_info.json");
const info_db = low(info_adapter)
info_db.read();
const powers_adapter = new FileSync("../data/superhero_powers.json");
const powers_db = low(powers_adapter)
powers_db.read();

const get_all_info = () => info_db.get("content").value();

const get_info = id => info_db.get("content").find({ "id": parseInt(id) }).value();

const get_all_powers = () => powers_db.get("content").value();

const get_powers = id => powers_db.get("content").find({ "hero_names": get_info(id).name }).value();

const get_publishers = () => {
    const data = info_db.get("content");
    const publisher_names = data.map("Publisher").value();
    const unique_publishers_set = new Set(
        publisher_names.filter(name => name.trim() !== '')
    );
    const unique_publishers_array = Array.from(unique_publishers_set);
    return unique_publishers_array;
}

const match = (field, match, n = 0) => {
    let superhero_info = info_db.get("content");
    const lower_case_field = field.toLowerCase();
    const lower_case_match = match.toLowerCase();

    if (n === 0) {
        return superhero_info
            .find(item => item[lower_case_field].toLowerCase().includes(lower_case_match))
            .map("id")
            .value();
    }
    else {
        return superhero_info
            .filter(item => item[lower_case_field].toLowerCase().includes(lower_case_match))
            .take(n)
            .map("id")
            .value();
    }
}
// console.log(get_all_info());
// console.log(get_info(0));
// console.log(get_powers(0));
// console.log(get_publishers());
// console.log(match("name", "spider", 2));

module.exports = {
    get_all_info,
    get_info,
    get_powers,
    get_publishers,
    match
};