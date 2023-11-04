const test = () => {
    const body = document.getElementsByClassName("body")[0];
    const list = document.getElementById("list");
    const div = document.getElementById("test");
    const header = document.getElementById("header");
    const url = `${location.protocol}//${location.host}/api/superheros_powers`;
    fetch(url)
        .then(resp => {
            if (!resp.ok) {
                return resp.text();
            }
            return resp.json();
        }).then((data) => {
            if (typeof data === "string") {
                const p = document.createElement("p");
                p.appendChild(document.createTextNode(data))
                div.insertBefore(p, div.firstChild);
                body.style.visibility = "visible";
                return;
            }
            for (let i = 0; i < data.length; i++) {
                let list_items = [];
                const para = document.createElement("p").appendChild(document.createTextNode(`${data[i].hero_names}'s Superhero Powers:`));
                const list = document.createElement("ul");
                header.appendChild(para);
                header.appendChild(list);
                let powers = get_true_properties(data[i]);
                body.style.visibility = "visible";
                for (let j = 0; j < powers.length; j++) {
                    let list_element = document.createElement("li");
                    list_items.push(list_element);
                    let textNode = document.createTextNode(powers[j]);
                    list_items[j].appendChild(textNode);
                    list.appendChild(list_items[j]);
                }
            }
            body.style.visibility = "visible";
        }).catch((data) => {
            console.log("Failed to convert response to JSON/text!")
        })
        .catch((error) => {
            console.log("Failed Fetch!")
        });

};
const get_true_properties = obj => {
    let true_properties = [];

    for (const prop in obj) {
        if (obj.hasOwnProperty(prop) && obj[prop] === "True") {
            true_properties.push(prop);
        }
    }

    return true_properties;
}

const home = () => {
    window.location.href = "/";
};