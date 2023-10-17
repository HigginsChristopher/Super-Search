const test = () => {
    const body = document.getElementsByClassName("body")[0];
    const list = document.getElementById("list");
    const url = location.protocol + '//' + location.host + "/api/superheros_info/" + window.location.href.split("id=")[1];
    console.log(url);
    fetch(url)
        .then(resp =>
            resp.json()
                .then((json) => {
                    console.log(json);
                    let list_items = [];
                    for (let i = 0; i < 10; i++) {
                        list_items.push(document.createElement("li"));
                    }
                    list_items[0].appendChild(document.createTextNode("id: " + json.id));
                    list_items[1].appendChild(document.createTextNode("name: " + json.name));
                    list_items[2].appendChild(document.createTextNode("Gender: " + json.Gender));
                    list_items[3].appendChild(document.createTextNode("Eye color: " + json["Eye color"]));
                    list_items[4].appendChild(document.createTextNode("Hair color: " + json["Hair color"]));
                    list_items[5].appendChild(document.createTextNode("Height: " + json.Height));
                    list_items[6].appendChild(document.createTextNode("Publisher: " + json.Publisher));
                    list_items[7].appendChild(document.createTextNode("Skin color: " + json["Skin color"]));
                    list_items[8].appendChild(document.createTextNode("Alignment: " + json.Alignment));
                    list_items[9].appendChild(document.createTextNode("Weight: " + json.Weight));
                    for (let i = 0; i < 10; i++) {
                        list.appendChild(list_items[i]);
                    }
                    body.style.visibility = "visible";
                })
                .catch((error) => console.log(error))
        )
        .catch((error) => console.log(error));
};