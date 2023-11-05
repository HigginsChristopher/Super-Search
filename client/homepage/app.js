// Direct to superheroes index.html (display all superhero info)
const super_heroes = () => {
    window.location.href = "/superheroes/index.html";
};

// Direct to powers index.html (display all superhero power info)
const powers = () => {
    window.location.href = "/powers/index.html";
};

// Direct to task1 index.html (display all superhero info for given id)
const task1 = () => {
    window.location.href = "/task1/index.html?id=" + String(document.getElementById("superhero_input").value);
};

// Direct to task2 index.html (display all superhero power info for given id)
const task2 = () => {
    window.location.href = "/task2/index.html?id=" + String(document.getElementById("power_input").value);
};

// Direct to task3 index.html (display all publishers)
const task3 = () => {
    window.location.href = "/task3/index.html";
};

// Direct to task4 index.html (display matches for given field, query and number of results)
const task4 = (event) => {
    event.preventDefault();
    const field = document.getElementById("field").value;
    const match = document.getElementById("match").value;
    const n = document.getElementById("n").value;
    // n is specified 
    if (n) {
        window.location.href = `/task4/index.html?field=${field}&match=${match}&n=${n}`;
    }
    else {
        window.location.href = `/task4/index.html?field=${field}&match=${match}`;
    }
};

// Direct to task5-9 index.html (manage lists)
const task5_9 = () => {
    window.location.href = "/task5-9/index.html";
};