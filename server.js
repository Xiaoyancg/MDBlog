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
        <span>main page, keywords, search by keywords</span>
    </div>
    <div class="contentDiv">
        <div class="article">
            <span>test</span>
        </div>
    </div>
</div>`;



const debug = require("debug");
const ds = debug("server");
const dj = debug("json");

const express = require("express")
const app = express();
const path = require("path")

const creater = require("create-html");
var toString = require('stream-to-string');
const Markdown = require("markdown-to-html").Markdown;
const jsonfile = require("jsonfile");
var fs = require("fs");

var indexArti = {};
jsonfile.readFile("indexArti.json",(err, obj)=>{
    if (err) {
        console.log("auto created empty article index.");
        indexArti["test"] = "test1";
        dj(indexArti);        
    }
    else {
        indexArti = obj;
    }
})

function autoSaveIndex() {
    jsonfile.writeFile("indexArti.json", indexArti);
    setTimeout(autoSaveIndex,3600000);
}
autoSaveIndex();
console.log(indexArti);

const hostname = "127.0.0.1";
const port = 3000;

dj("???")


var arti=[];
var md = new Markdown();
var testfile = "articles/test.md";
var opts ={title:"test title"};
md.render(testfile,opts,(err)=>{
    if(err){
        console.error(">>>" + err);
        //process.exit();
    }
    //md.pipe(process.stdout);
    toString(md, (err,msg) => {
        //console.log(msg);
        arti=msg;
    });
});


app.get("*.css", (req,res)=>{
    // ds(req.path);
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
    // ds(req.hostname);
    // res.sendFile(__dirname + "/doc" + "/index.html");
});



app.listen(port, hostname, function(){
    ds(`Server is listening at ${hostname}:${port}.`);

})

