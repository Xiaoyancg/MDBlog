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
const ds = debug("server"); // debug server
const dj = debug("json"); // debug json

const express = require("express")
const app = express();
const path = require("path")

const creater = require("create-html");
var toString = require('stream-to-string');
const Markdown = require("markdown-to-html").Markdown;
const jsonfile = require("jsonfile");
var fs = require("fs");
const timestamp = require('time-stamp');

// auto save
function autoSaveIndex() {
    dj("save")
    jsonfile.writeFile("indexArti.json", indexArtiJSON, {spaces:4}, (err)=>{
        if(err){
            dj("autoSaveIndex: ",err);
        }
    });
    setTimeout(autoSaveIndex,3600000);
}

var indexArtiJSON = {};
var indexArti = {};
var articles = {};


jsonfile.readFile("indexArti.json")
    .then(obj =>{
        indexArtiJSON = obj;
        indexArti = indexArtiJSON["data"];
        dj("exist",indexArti)
        dj("test article: ", indexArti["articles"][indexArti["numArticles"]-1]);
    })
    .catch(err => {
        if (err) {
            dj("catch:",err)
            console.log("auto created empty article index.");
            // test test.md
            testArti = {"name": "test", "keyword": "test", "filename":"test.md", "upload":"2022/06/15 23:30:10:100 UTC-4", "change":timestamp("YYYY/MM/DD HH:mm:ss:ms UTC-4")}
            indexArti["articles"] = [testArti];
            indexArti["numArticles"] = 1;
            indexArtiJSON = {
                "name":"indexArti",
                "location": "./indexArti",
                "data": indexArti
            }
            dj(indexArtiJSON);
            autoSaveIndex();
        }
    })



const hostname = "127.0.0.1";
const port = 3000;


// test markdown
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

