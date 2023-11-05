// Method to trigger onload that displays all superhero powers
const onload = async () => {
    // Initializing DOM elements
    const body = document.getElementsByClassName("body")[0];
    const list = document.getElementById("list");
    let data;
    // Creating URL
    const url = `${location.protocol}//${location.host}/api/superheros_powers`;
    try {
        // Fetching URL
        const resp = await fetch(url);
        // Response is not ok (code 200)
        if (!resp.ok) {
            // Alert with response text
            const errorText = await resp.text();
            alert(errorText);
            return;
        }
        // Get JSON data from response
        data = await resp.json();
    } catch (error) {
        alert("An error occurred: " + error);
    }
    // Add data to HTML
    for (let i = 0; i < data.length; i++) {
        // Initializing DOM elements
        const list_element = document.createElement("li");
        const text_content = document.createTextNode(`${data[i].hero_names}'s Superhero Powers:`);
        const new_list = document.createElement("ul");
        // Organizing content
        list_element.appendChild(text_content);
        list.appendChild(list_element);
        list_element.appendChild(new_list);
        // Getting true powers for data
        let powers = get_true_properties(data[i]);
        // Adding powers to HTML
        for (let j = 0; j < powers.length; j++) {
            let new_list_element = document.createElement("li");
            let textNode = document.createTextNode(powers[j]);
            new_list_element.appendChild(textNode);
            new_list.appendChild(new_list_element);
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