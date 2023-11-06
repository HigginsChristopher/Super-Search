// Method to trigger onload that displays all superhero publisher names
const onload = async () => {
    // Initializing DOM elements
    const body = document.getElementsByClassName("body")[0];
    const list = document.getElementById("list");
    let data;
    // Creating URL
    const url = `${location.protocol}//${location.host}/api/superheros_info/publishers`;
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
    // Adding data to HTML
    for (let i = 0; i < data.length; i++) {
        const list_element = document.createElement("li");
        list_element.appendChild(document.createTextNode(data[i]));
        list.appendChild(list_element);
    }
    // Unhide content
    body.style.visibility = "visible";
};

// Method to redirect to homepage
const home = () => {
    window.location.href = "/";
};