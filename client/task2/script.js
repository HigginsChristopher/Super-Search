const test = () => {
    const paragraph = document.getElementById("paragraph");
    const body = document.getElementsByClassName("body")[0];
    const list = document.getElementById("list");
    const div = document.getElementById("test");
    const id = window.location.href.split("id=")[1];
    if (id == "") {
        const p = document.createElement("p");
        p.appendChild(document.createTextNode(`"ID" is not allowed to be empty`))
        div.insertBefore(p, div.firstChild);
        body.style.visibility = "visible";
        return;
    }
    const url = `${location.protocol}//${location.host}/api/superheros_powers/${id}`;
    fetch(url)
        .then(resp => {
            if (!resp.ok) {
                return resp.text();
            }
            return resp.json();
        })
        .then((data) => {
            if (typeof data === "string") {
                const p = document.createElement("p");
                p.appendChild(document.createTextNode(data))
                div.insertBefore(p, div.firstChild);
                body.style.visibility = "visible";
                return;
            }
            paragraph.appendChild(document.createTextNode(`${data.hero_names}'s Superhero Powers (ID: ${id}):`))
            let powers = get_true_properties(data);
            let list_items = [];
            for (let i = 0; i < powers.length; i++) {
                let list_element = document.createElement("li");
                list_items.push(list_element);
                let textNode = document.createTextNode(powers[i]);
                list_items[i].appendChild(textNode);
                list.appendChild(list_items[i]);
            }
            body.style.visibility = "visible";
        })
        .catch((error) => {
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