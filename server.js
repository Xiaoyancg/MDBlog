const http = require("http");

const hostname = "127.0.0.1";
const port = 3000;

const requestListener = function(req, res) {
    req.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello, World!");
};

const server = http.createServer(requestListener);
server.listen(port, hostname, function(){console.log(`Server is running at http://${hostname}:${port}`)});
