// Method to trigger onload that displays superhero powers for given id
const onload = async () => {
    // Initializing DOM elements
    const paragraph = document.getElementById("paragraph");
    const body = document.getElementsByClassName("body")[0];
    const id = window.location.href.split("id=")[1];
    let data;
    // id is undefined, display error to screen
    if (id == "") {
        paragraph.appendChild(document.createTextNode(`"ID" is not allowed to be empty`))
    }
    else {
        // Creating URL
        const url = `${location.protocol}//${location.host}/api/superheros_powers/${id}`;
        try {
            // Fetching URL
            const resp = await fetch(url);
            // Response is not ok, display error message on screen
            if (!resp.ok) {
                const error_text = await resp.text();
                paragraph.appendChild(document.createTextNode(error_text));
                body.style.visibility = "visible";
                return;
            }
            // Get JSON data from response
            data = await resp.json();
        } catch (error) {
            console.log("An error occurred: " + error);
        }
        // Initializing DOM elements
        const text_content = document.createTextNode(`${data.hero_names}'s Superhero Powers (ID: ${id}):`);
        const new_list = document.createElement("ul");
        paragraph.appendChild(text_content);
        paragraph.appendChild(new_list);
        let list_items = [];
        // Getting true powers for data
        let powers = get_true_properties(data);
        // Adding data to HTML
        for (let i = 0; i < powers.length; i++) {
            let list_element = document.createElement("li");
            list_items.push(list_element);
            let textNode = document.createTextNode(powers[i]);
            list_items[i].appendChild(textNode);
            new_list.appendChild(list_items[i]);
        }
    }
    // Unhide content
    body.style.visibility = "visible";
};

// Method that gets true (string) properties for a given object
const get_true_properties = obj => {
    let true_properties = [];
    for (const prop in obj) {
        if (obj.hasOwnProperty(prop) && obj[prop] === "True") {
            true_properties.push(prop);
        }
    }
    return true_properties;
}

// Method to redirect to homepage
const home = () => {
    window.location.href = "/";
};