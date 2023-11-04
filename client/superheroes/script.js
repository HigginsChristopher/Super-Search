const test = () => {
    const body = document.getElementsByClassName("body")[0];
    const list = document.getElementById("list");
    const div = document.getElementById("test");
    const header = document.getElementById("header");
    const url = `${location.protocol}//${location.host}/api/superheros_info`;
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
                const para = document.createElement("p").appendChild(document.createTextNode(`Name: ${data[i].name} - ID: ${data[i].id}:`));
                const list = document.createElement("ul");
                header.appendChild(para);
                header.appendChild(list);
                body.style.visibility = "visible";
                for (let j = 0; j < 9; j++) {
                    list_items.push(document.createElement("li"));
                }
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
                    list.appendChild(list_items[k]);
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

const home = () => {
    window.location.href = "/";
};