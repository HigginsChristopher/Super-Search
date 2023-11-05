// Method to trigger onload that displays superhero information for given id
const onload = async () => {
    // Initializing DOM elements
    const paragraph = document.getElementById("paragraph");
    const body = document.getElementsByClassName("body")[0];
    const id = window.location.href.split("id=")[1];
    let data;
    // id is undefined, display error to screen
    if (id === "") {
        paragraph.appendChild(document.createTextNode(`"ID" is not allowed to be empty`));
    }
    else {
        // Creating URL
        const url = `${location.protocol}//${location.host}/api/superheros_info/${id}`;
        try {
            // Fetching URL
            const resp = await fetch(url);
            // Response is not ok, display error message on screen
            if (!resp.ok) {
                const errorText = await resp.text();
                paragraph.appendChild(document.createTextNode(errorText));
                body.style.visibility = "visible";
                return;
            }
            // Get JSON data from response
            data = await resp.json();
        } catch (error) {
            console.log("An error occurred: " + error);
        }
        // Initializing DOM elements
        const text_content = document.createTextNode(`${data.name}'s Superhero Information (ID: ${id}):`);
        const new_list = document.createElement("ul");
        paragraph.appendChild(text_content);
        paragraph.appendChild(new_list);
        let list_items = [];
        for (let i = 0; i < 9; i++) {
            list_items.push(document.createElement("li"));
        }
        // Adding data to HTML
        list_items[0].appendChild(document.createTextNode("Gender: " + data.Gender));
        list_items[1].appendChild(document.createTextNode("Eye color: " + data["Eye color"]));
        list_items[2].appendChild(document.createTextNode("Race: " + data.Race));
        list_items[3].appendChild(document.createTextNode("Hair color: " + data["Hair color"]));
        list_items[4].appendChild(document.createTextNode("Height: " + data.Height));
        list_items[5].appendChild(document.createTextNode("Publisher: " + data.Publisher));
        list_items[6].appendChild(document.createTextNode("Skin color: " + data["Skin color"]));
        list_items[7].appendChild(document.createTextNode("Alignment: " + data.Alignment));
        list_items[8].appendChild(document.createTextNode("Weight: " + data.Weight));
        for (let i = 0; i < 9; i++) {
            new_list.appendChild(list_items[i]);
        }
    }
    // Unhide content
    body.style.visibility = "visible";
};

// Method to redirect to homepage
const home = () => {
    window.location.href = "/";
};