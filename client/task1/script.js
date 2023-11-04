const test = () => {
    const paragraph = document.getElementById("paragraph");
    const body = document.getElementsByClassName("body")[0];
    const list = document.getElementById("list");
    const div = document.getElementById("test");
    const id = window.location.href.split("id=")[1];
    if(id==""){
        const p = document.createElement("p");
        p.appendChild(document.createTextNode(`"ID" is not allowed to be empty`))
        div.insertBefore(p, div.firstChild);
        body.style.visibility = "visible";
        return;
    }
    const url = `${location.protocol}//${location.host}/api/superheros_info/${id}`;
    console.log(url)
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
            paragraph.appendChild(document.createTextNode(`${data.name}'s Superhero Information (ID: ${id}):`))
            let list_items = [];
            for (let i = 0; i < 9; i++) {
                list_items.push(document.createElement("li"));
            }
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
                list.appendChild(list_items[i]);
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