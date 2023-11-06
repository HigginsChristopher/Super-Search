// Initial data
let initial_data = [];
let initial_powers = [];

// Method to trigger test that displays all lists to manage
const onload = async () => {
    // Initializing DOM elements
    const body = document.getElementsByClassName("body")[0];
    const paragraph = document.getElementById("paragraph");
    const form1 = document.getElementById("field1");
    const form2 = document.getElementById("field2");
    const form3 = document.getElementById("field3");
    // Creating URL for lists
    const url = `${location.protocol}//${location.host}/api/lists`;
    try {
        // Fetching URL
        const resp = await fetch(url);
        // Response is not ok, alert error message
        if (!resp.ok) {
            alert(resp)
        }
        // Get JSON data from response
        const data = await resp.json();
        // Update form details
        update_forms(data, form1, form2, form3);
    } catch (error) {
        console.error("An error occurred:", error);
    }
    // Unhide content and sort button
    body.style.display = "block";

};

// Method to delete list
const delete_list = async () => {
    // Initializing DOM elements
    const sort = document.getElementById("sort");
    const paragraph = document.getElementById("paragraph");
    const body = document.getElementsByClassName("body")[0];
    const list = document.getElementById("list");
    const div = document.getElementById("test");
    const form2 = document.getElementById("field2");
    const selectedOption = form2.options[form2.selectedIndex].value;
    // Creating URL for list deletion
    const url = `${location.protocol}//${location.host}/api/lists/${selectedOption}`;
    try {
        // Fetching URL
        const resp = await fetch(url, {
            method: "DELETE"
        })
        // Getting text of response
        const data = await resp.text();
        // Empty reponse, success
        if (data === "") {
            // Call onload to update forms
            onload();
        }
        // alert error message
        else {
            alert(data);
            return;
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
    // Hide sort menu
    sort.style.display = "none";
};

// Method to create list
const create_list = async () => {
    // Initializing DOM elements
    const sort = document.getElementById("sort");
    // Creating URL for list creation
    const url = `${location.protocol}//${location.host}/api/lists/`;
    const name = document.getElementById("nameinput").value
    let superhero_ids = document.getElementById("idinput").value
    try {
        superhero_ids = JSON.parse("[" + superhero_ids + "]");
    } catch (ignored) { }
    const data = {
        "name": name,
        "superhero_ids": superhero_ids
    };
    try {
        // Fetching URL
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        // Getting text of response
        const new_data = await resp.text();
        // Empty reponse, success
        if (new_data === "") {
            // Call onload to update forms
            onload();
        }
        // alert error message
        else {
            alert(new_data);
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
    // Hide sort menu
    sort.style.display = "none";
}

// Method to update list
const update_list = async () => {
    // Initializing DOM elements
    const sort = document.getElementById("sort");
    const form1 = document.getElementById("field1");
    const selectedOption = form1.options[form1.selectedIndex].value;
    let superhero_ids = document.getElementById("updateidinput").value
    // Creating URL for updating a list
    const url = `${location.protocol}//${location.host}/api/lists/${selectedOption}`;
    try {
        superhero_ids = JSON.parse("[" + superhero_ids + "]");
    } catch (ignored) { }
    const data = {
        "superhero_ids": superhero_ids
    };
    try {
        // Fetching URL
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        // Getting text of response
        const new_data = await resp.text();
        // Empty reponse, success
        if (new_data === "") {
            // Call onload to update forms
            onload();
        }
        // alert error message
        else {
            alert(new_data);
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
    // Hide sort menu
    sort.style.display = "none";
};

// Method to view list
const view_list = async () => {
    try {
        // Initializing DOM elements
        const body = document.getElementsByClassName("body")[0];
        const list = document.getElementById("list");
        const sort = document.getElementById("sort");
        const form3 = document.getElementById("field3");
        const paragraph = document.getElementById("paragraph");
        const selectedOptionName = form3.options[form3.selectedIndex].innerText;
        const selectedOptionID = form3.options[form3.selectedIndex].value;
        // Creating URL for viewing list
        const url = `${location.protocol}//${location.host}/api/lists/ids?name=${encodeURIComponent(selectedOptionName)}`;
        // Fetching URL
        const response = await fetch(url);
        // Response is not ok, display error message on screen
        if (!response.ok) {
            const data = await response.text();
            alert(data);
            return;
        }
        // Get JSON data from response
        const data = await response.json();
        // Creating URL for details url
        const details_url = `${location.protocol}//${location.host}/api/lists/details?id_list=[${data}]`;
        const details_response = await fetch(details_url);
        // Response is not ok, display error message on screen
        if (!details_response.ok) {
            const details_data = await details_response.text();
            alert(details_data);
            return;
        }
        // Get JSON data from response
        const details_data = await details_response.json();
        // Resetting initial data
        initial_data = []
        initial_powers = []
        // Adding initial data
        for (let i = 0; i < details_data.length; i++) {
            initial_data.push(details_data[i]);
            initial_powers.push(details_data[i].powers);
        }
        // Clearing screen contents
        paragraph.innerHTML = "";
        list.innerHTML = "";
        // Adding content
        const list_name = document.createTextNode(`List Details - Name: ${selectedOptionName} (ID: ${selectedOptionID}):`)
        paragraph.appendChild(list_name);
        sort.style.display = "block";
        // Calling display content to display content
        display_content();
    } catch (error) {
        console.error("An error occurred:", error);
    }
};

// Method to contents of froms
const update_forms = (data, form1, form2, form3) => {
    // Clear list and paragraph contents
    const paragraph = document.getElementById("paragraph");
    const list = document.getElementById("list");
    paragraph.innerHTML = "";
    list.innerHTML = "";
    // Clear existing options from the forms
    form1.innerHTML = "";
    form2.innerHTML = "";
    form3.innerHTML = "";
    // Update forms with new data
    for (let i = 0; i < data.length; i++) {
        let option = document.createElement("option");
        option.setAttribute("value", data[i].id);
        option.appendChild(document.createTextNode(data[i]["list-name"]));
        // Create separate copies of the option for each form
        let option1 = option.cloneNode(true);
        let option2 = option.cloneNode(true);
        let option3 = option.cloneNode(true);
        form1.appendChild(option1);
        form2.appendChild(option2);
        form3.appendChild(option3);
    }
};

// Function used to sort data (powers is unique)
const sorting_algorithm = () => {
    const list = document.getElementById("list");
    // Initializing DOM elements
    const sort_field = document.getElementsByClassName("test")[0].value;
    const selectedObject = document.getElementById("myForm3");
    // Initializing power hash map
    const powers_hash_map = {};
    // Clearing list content
    list.innerHTML = "";
    // Power field is being sorted
    if (sort_field == "data-powers") {
        const powers_to_heroes_map = {};
        // All objects have the same keys
        const powers_list = Object.keys(initial_powers[0]);
        // Remove the hero name key from the list of powers
        const index_of_hero_names = powers_list.indexOf("hero_names");
        if (index_of_hero_names !== -1) {
            powers_list.splice(index_of_hero_names, 1);
        }
        // Initialize the values for each power with an empty array
        powers_list.forEach(power => {
            powers_to_heroes_map[power] = [];
        });
        // Iterate through the data and populate the hashmap
        initial_powers.forEach(hero_data => {
            const hero_name = hero_data["hero_names"];
            powers_list.forEach(power => {
                if (hero_data[power] === "True") {
                    powers_to_heroes_map[power].push(hero_name);
                }
            });
        });
        // Create a list item for each power and its associated superhero names
        for (const power in powers_to_heroes_map) {
            const hero_names = powers_to_heroes_map[power];
            // Check if there are associated superheroes for the power
            if (hero_names.length > 0) {
                // Create a list item for the power
                const list_item = document.createElement("li");
                list_item.textContent = `Power: ${power}`;
                // Create a nested list for superhero names
                const hero_list = document.createElement("ul");
                hero_names.forEach(hero_name => {
                    const hero_list_item = document.createElement("li");
                    hero_list_item.textContent = hero_name;
                    hero_list.appendChild(hero_list_item);
                });
                // Append the nested list to the power list item
                list_item.appendChild(hero_list);
                // Append the power list item to the HTML list
                list.appendChild(list_item);
            }
        }
    }
    // All other fields are being sorted
    else {
        // Call to display content to organize original data
        display_content();
        // Getting children of list to sort
        const items = Array.from(list.children);
        // Sorting list elements
        items.sort((a, b) => {
            const valueA = a.getAttribute(sort_field).toLowerCase();
            const valueB = b.getAttribute(sort_field).toLowerCase();
            return valueA.localeCompare(valueB);
        });
        // Clear list to display sorted content
        list.innerHTML = "";
        // Display sorted content
        items.forEach(item => list.appendChild(item));
    }
}

// Method to redirect to homepage
const home = () => {
    window.location.href = "/";
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
};

// Used to display and populate original content onto list
const display_content = () => {
    const list = document.getElementById("list");
    list.innerHTML = "";
    for (const hero of initial_data) {
        // Creating element with all superhero info and adding it to list
        let element = document.createElement("li");
        element.setAttribute("data-id", hero.id);
        element.setAttribute("data-name", hero.name);
        element.setAttribute("data-gender", hero.Gender);
        element.setAttribute("data-eye_color", hero["Eye color"]);
        element.setAttribute("data-race", hero.Race);
        element.setAttribute("data-hair_color", hero["Hair color"]);
        element.setAttribute("data-height", hero.Height);
        element.setAttribute("data-publisher", hero.Publisher);
        element.setAttribute("data-skin_color", hero["Skin color"]);
        element.setAttribute("data-alignment", hero.Alignment);
        element.setAttribute("data-weight", hero.Weight);
        const textContent = document.createTextNode(`ID: ${hero.id} | Name: ${hero.name} | 
        Gender: ${hero.Gender} | Eye Color: ${hero["Eye color"]} | Race: ${hero.Race} | Hair Color: 
        ${hero["Hair color"]} | Height: ${hero.Height} | Publisher: ${hero.Publisher} | Skin Color: 
        ${hero["Skin color"]} | Alignment: ${hero.Alignment} | Weight: ${hero.Weight}`)
        element.appendChild(textContent);
        list.appendChild(element);
        let result = initial_powers.find(current_hero => current_hero.hero_names === hero.name);
        // Adding all superhero powers to list 
        if (result) {
            result = get_true_properties(result);
            let list2 = document.createElement("ul");
            list2.appendChild(document.createTextNode("Powers:"));
            for (let j = 0; j < result.length; j++) {
                let list_element = document.createElement("li");
                list_element.appendChild(document.createTextNode(result[j]));
                list2.appendChild(list_element);
            }
            element.appendChild(list2);
        }
    }
};