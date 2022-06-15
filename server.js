var indexHead = `
<meta charset="utf-8" name="viewport" content="width=device-width.initial-scale=1.0*">`;

var indexCss = `
<style>
body {
    background-color: #10151b;
    color: rgb(237,237,237);
    z-index: -10;
    align-items: center;
}

.bodyDiv {
    background-color: #18222f;
    border:0px;
    width: 964px;
    height: 1000px;
    padding: 0px;
    margin:auto;
    align-items: center;
}
.titleDiv {
    margin:auto;
    padding-top: 10px;
    padding-bottom: 10px;
    background-color: #151920;
    color:rgb(237, 237, 237);
    font-family: "Lucida Console", "Courier New", monospace;
    align-items: center;
    text-align: center;
}

.indexDiv {
    text-align: center;
    align-items: center;
}

h1 {
    font-size: 100px;
    margin:0px;
}
</style>`;

var indexTitle = `<title>realcodecg</title>`;
var indexLang = `en`;
var indexBody = `
<div class="bodyDiv">
    <div class="titleDiv">
        <h1 class="title">Real Code CG</span>
    </div>
    <div class="indexDiv">
        <span>about</span>
    </div>
    <div class="contentDiv">
        <div class="article">
            <span>test</span>
        </div>
    </div>
</div>`;



const debug = require("debug");
const dr = debug("server")

const express = require("express")
const app = express();
const path = require("path")

const creater = require("create-html")

var toString = require('stream-to-string')

const hostname = "127.0.0.1";
const port = 3000;


const Markdown = require("markdown-to-html").Markdown;
var arti=[];
var md = new Markdown();
var testfile = "articles/test.md";
var opts ={title:"test title"};
md.render(testfile,opts,(err)=>{
    if(err){
        console.error(">>>" + err);
        //process.exit();
    }
    md.pipe(process.stdout);
    toString(md, (err,msg) => {
        //console.log(msg);
        arti=msg;
    });
});

console.log(arti);

app.get("*.css", (req,res)=>{
    // dr(req.path);
    // res.sendFile(__dirname + "/doc" + req.path);
})

app.get("/about/", (req, res)=>{
    res.send(cr)
})

app.get("/", function(req, res) {
    res.send(creater({
        title:indexTitle,
        lang: indexLang,
        head: indexHead+indexCss,
        body:indexBody,
    }))
    // dr(req.hostname);
    // res.sendFile(__dirname + "/doc" + "/index.html");
});



app.listen(port, hostname, function(){
    dr(`Server is listening at ${hostname}:${port}.`);

})

