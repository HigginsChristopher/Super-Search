// Method to trigger onload that displays all superhero information
const onload = async () => {
    try {
        // Initializing DOM elements
        const body = document.getElementsByClassName("body")[0];
        const list = document.getElementById("list");
        // Creating URL and fetching 
        const url = `${location.protocol}//${location.host}/api/superheros_info`;
        const resp = await fetch(url);
        // Response is not ok (code 200)
        if (!resp.ok) {
            // Alert with response text
            const errorText = await resp.text();
            alert(errorText);
            return;
        }
        // Get JSON data from response
        const data = await resp.json();
        // Add data to HTML
        for (let i = 0; i < data.length; i++) {
            let list_items = [];
            // Initializing DOM elements
            const list_element = document.createElement("li");
            const new_list = document.createElement("ul");
            const text_content = document.createTextNode(`Name: ${data[i].name} - ID: ${data[i].id}:`);
            // Organizing content
            list_element.appendChild(text_content);
            list.appendChild(list_element);
            list_element.appendChild(new_list);
            for (let j = 0; j < 9; j++) {
                const li = document.createElement("li");
                list_items.push(document.createElement("li"));
            }
            // Adding data to HTML
            list_items[0].appendChild(document.createTextNode("Gender: " + data[i].Gender));
            list_items[1].appendChild(document.createTextNode("Eye color: " + data[i]["Eye color"]));
            list_items[2].appendChild(document.createTextNode("Race: " + data[i].Race));
            list_items[3].appendChild(document.createTextNode("Hair color: " + data[i]["Hair color"]));
            list_items[4].appendChild(document.createTextNode("Height: " + data[i].Height));
            list_items[5].appendChild(document.createTextNode("Publisher: " + data[i].Publisher));
            list_items[6].appendChild(document.createTextNode("Skin color: " + data[i]["Skin color"]));
            list_items[7].appendChild(document.createTextNode("Alignment: " + data[i].Alignment));
            list_items[8].appendChild(document.createTextNode("Weight: " + data[i].Weight));
            for (let k = 0; k < 9; k++) {
                new_list.appendChild(list_items[k]);
            }
        }
        // Unhide content
        body.style.visibility = "visible";
    } catch (error) {
        alert("An error occurred: " + error);
    }
};

// Method to redirect to homepage
const home = () => {
    window.location.href = "/";
};