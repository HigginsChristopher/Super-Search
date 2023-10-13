const http = require("http");
const PORT = 3000;

const server = http.createServer((req,res) =>{
    if(req.url === "/"){
        res.write("Hello World");
        res.end();
    }
    if(req.url ==="/api/courses"){
        res.write(JSON.stringify([1,2,3]));
        res.end();
    }
});

server.listen(PORT);
console.log("Listening on port 3000...")