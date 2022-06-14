const debug = require("debug");
const dr = debug("server")

const express = require("express")
const app = express();
const path = require("path")


const hostname = "127.0.0.1";
const port = 3000;

//const Markdown = require("markdown-to-html/lib/markdown");
//var markdown = require("markdown-to-html").Markdown;
//var md = new Markdown();

app.get("/", function(req, res) {
    dr(req.hostname);
    res.sendFile(__dirname + "doc/" + "index.html");
});

app.listen(port, hostname, function(){
    dr(`Server is listening at ${hostname}:${port}.`);
})

