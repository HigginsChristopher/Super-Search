// Initial data
let initial_powers = [];
let initial_data = [];

// Method to trigger onload that displays superhero details for given match, field, and number of results
const onload = async () => {
    try {
        // Initializing DOM elements
        const sort = document.getElementById("sort");
        const body = document.getElementsByClassName("body")[0];
        const list = document.getElementById("list");
        const paragraph = document.getElementById("paragraph");
        // Creating URL for match results
        let current_url = window.location.href.split("?")[1];
        const field = current_url.split("&")[0].split("=")[1];
        const match = encodeURIComponent(current_url.split("&")[1].split("=")[1]);
        // n is passed in
        if (current_url.split("&")[2]) {
            const n = current_url.split("&")[2].split("=")[1];
            current_url = `field=${field}&match=${match}&n=${n}`;
        }
        // n is not passed in
        else {
            current_url = `field=${field}&match=${match}`;
        }
        const url = `${location.protocol}//${location.host}/api/superheros_info/match?${current_url}`;
        // Fetching URL
        const resp = await fetch(url);
        // Response is not ok, display error message on screen
        if (!resp.ok) {
            const error_text = await resp.text();
            paragraph.appendChild(document.createTextNode(error_text));
            paragraph.appendChild(document.createElement("br"))
            body.style.display = "block";
            return;
        }
        // Get JSON data from response
        const data = await resp.json();
        // Creating URL for id_list details
        const url2 = `${location.protocol}//${location.host}/api/lists/details?id_list=[${data}]`;
        // Fetching URL
        const details = await fetch(url2);
        // Response is not ok, display error message on screen
        if (!details.ok) {
            const error_text = await details.text();
            paragraph.appendChild(document.createTextNode(error_text));
            paragraph.appendChild(document.createElement("br"))
        }
        // Get JSON data from response
        const details_json = await details.json();
        // Adding data to intial datasets
        for (let i = 0; i < details_json.length; i++) {
            initial_powers.push(details_json[i].powers)
            const { powers, ...new_object } = details_json[i];
            initial_data.push(new_object)
        }
        // Unhide content and sort button
        body.style.display = "block";
        sort.style.display = "block";
        // Call to display content
        display_content();
    } catch (error) {
        console.error("An error occurred:", error);
    }
};

// Function used to sort data (powers is unique)
const sortAlgorithm = () => {
    // Initializing DOM elements
    const list = document.getElementById("list");
    const sort_field = document.getElementById('sort_field').value;
    // Initializing power hash map
    const powers_hash_map = {};
    // Clearing list content
    list.innerHTML = "";
    // Power field is being sorted
    if (sort_field == "data-powers") {
        const power_to_heroes_map = {};
        // All objects have the same keys
        const powersList = Object.keys(initial_powers[0]);
        // Remove the hero name key from the list of powers
        const indexOfhero_names = powersList.indexOf("hero_names");
        if (indexOfhero_names !== -1) {
            powersList.splice(indexOfhero_names, 1);
        }
        // Initialize the values for each power with an hashmap
        powersList.forEach(power => {
            power_to_heroes_map[power] = [];
        });
        // Iterate through the data and populate the hashmap
        initial_powers.forEach(heroData => {
            const hero_name = heroData["hero_names"];
            powersList.forEach(power => {
                if (heroData[power] === "True") {
                    power_to_heroes_map[power].push(hero_name);
                }
            });
        });
        // Create a list item for each power and its associated superhero names
        let iteration = 1;
        for (const power in power_to_heroes_map) {
            const hero_names = power_to_heroes_map[power];
            // Check if there are associated superheroes for the power
            if (hero_names.length > 0) {
                // Create a list item for the power
                const list_item = document.createElement("li");
                list_item.textContent = `Result: ${iteration} - Power: ${power}`;
                iteration += 1;
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
}

// Used to display and populate original content onto list
const display_content = () => {
    const list = document.getElementById("list");
    let iteration = 0;
    for (const hero of initial_data) {
        // Creating element with all superhero info and adding it to list
        iteration += 1;
        let element = document.createElement("li");
        element.appendChild(document.createTextNode(`Result: ${iteration} - `))
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
        element.appendChild(document.createElement("br"));
        element.appendChild(document.createTextNode("Powers:"));
        list.appendChild(element);
        // Adding all superhero powers to list 
        let result = initial_powers.find(currentHero => currentHero.hero_names === hero.name);
        if (result) {
            result = get_true_properties(result);
            let list2 = document.createElement("ul");
            for (let j = 0; j < result.length; j++) {
                let list_element = document.createElement("li");
                list_element.appendChild(document.createTextNode(result[j]));
                list2.appendChild(list_element);
            }
            element.appendChild(list2);
        }
    }
};