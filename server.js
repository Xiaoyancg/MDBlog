var indexHead = `
<meta charset="utf-8" name="viewport" content="width=device-width.initial-scale=1.0*">
`;

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

.menuBarDiv {
    text-align: center;
    align-items: center;
}

#realcodecg {
    font-size: 100px;
    margin:0px;
}
</style>
`;

var indexTitle = `<title>real code cg</title>
`;
var indexLang = `en`;
var bodyHead = `
<div class="bodyDiv">
    <div class="titleDiv">
        <h1 class="title" id="realcodecg">Real Code CG</span>
    </div>
    <div class="menuBarDiv">
        <span><a href="/">index</a>, keywords</span>
    </div>
`;

var bodyEnd =`
</div>`;

var indexBodyUpper = `
    <div class="indexDiv">
`;
var indexBody = ``;
var indexBodyLower = `
    </div>
`;

var artiBodyUpper = `
    <div class="articleDiv>
`;
var artiBodyLower = `
    </div>
`;

const debug = require("debug");
const ds = debug("server"); // debug server
const dj = debug("json"); // debug json
const dm = debug("markdown"); // debug markdown
const dt = debug("html"); // debug html

const express = require("express")
const app = express();
const path = require("path")

const HTMLCreater = require("create-html");
var showdown  = require('showdown');
var converter = new showdown.Converter();

const jsonfile = require("jsonfile");
const fs = require("fs");
const util = require("util");
const timestamp = require('time-stamp');

var artiIndexJSON = {};
var artiIndex = {};
var articles = {};
var artiOrder = [];
var numArticles = 0;

var keyIndexJSON = {};
var keyIndex = {};

// auto save
function autoSaveArti() {
    jsonfile.writeFile("artiIndex.json", artiIndexJSON, {spaces:4}, (err)=>{
        if(err){
            dj("autoSaveIndex: ",err);
        }
    });
    
    dj("saved arti index")
    setTimeout(autoSaveArti,3600000);
}

function autoSaveKey() {
    jsonfile.writeFile("keyIndex.json", keyIndexJSON, {spaces:4}, (err)=>{
        if(err) {
            dj("auto save key:", err);
        }
    });
    
    dj("save key index")
    setTimeout(autoSaveKey, 3600000);
}


jsonfile.readFile("keyIndex.json")
    .then(obj => {
        keyIndexJSON = obj;
        keyIndex = keyIndexJSON["data"];
        dj("key index read");
    })
    .catch(err => {
        if (err) {
            dj("read key catch", err)
            keyIndex = {
                "keys": {
                    "test": ["test","test2"],
                    "test2": ["test2"]
                },
                "numKeys":2,
                "orderList":[
                    {
                        "kid":1,
                        "kname":"test"
                    },
                    {
                        "kid":2,
                        "kname":"test2"
                    }
                ]
            }
            keyIndexJSON = {
                "name": "keyIndex",
                "location": "./keyIndex.json",
                "data":keyIndex,
                "lastModifiedTime":timestamp("YYYY/MM/DD HH:mm:ss:ms UTC-4")
            }
            autoSaveKey();
        }
    })

jsonfile.readFile("artiIndex.json")
    .then(obj =>{
        artiIndexJSON = obj;
        artiIndex = artiIndexJSON["data"];
        articles = artiIndex["articles"];
        artiOrder = artiIndex["orderList"];
        numArticles = artiIndex["numArticles"];
        //dj("articles", articles);
        //dj("orderList", orderList)
        artiOrder.forEach(element => {
            //dj("element", articles[element["name"]])
            aname = element["aname"]
            indexBody += 
                "<p><a href=\"/article/" + aname + "\">" 
                + aname +"</a><br><span>keywords: " 
                + articles[aname]["keywords"] 
                + "</span></p>";
        });
        indexBody += indexBodyLower;
        dj("arti index read")
    })
    .catch(err => {
        if (err) {
            dj("read arti catch:",err)
            // test test.md
            testArti = {"name": "test", "keywords": ["test"], "filename":"test.md", "upload":"2022/06/15 23:30:10:100 UTC-4", "change":timestamp("YYYY/MM/DD HH:mm:ss:ms UTC-4")};
            var testArti2 = {"name": "test2", "keywords": ["test","test2"], "filename":"test2.md", "upload":"2022/06/15 23:30:10:100 UTC-4", "change":timestamp("YYYY/MM/DD HH:mm:ss:ms UTC-4")}
            artiIndex["articles"] = {};
            artiIndex["articles"]["test"]=testArti;
            artiIndex["articles"]["test2"]=testArti2;
            artiIndex["numArticles"] = 2;
            artiIndex["orderList"] = [];
            artiIndex["orderList"].push({"aid":1, "aname":"test"});
            artiIndex["orderList"].push({"aid":2, "aname":"test2"});
            artiIndexJSON = {
                "name":"artiIndex",
                "location": "./artiIndex.json",
                "data": artiIndex,
                "lastModifiedTime":timestamp("YYYY/MM/DD HH:mm:ss:ms UTC-4")
            }
            dj("init test indexArti");
            autoSaveIndex();
        }
    })



const hostname = "127.0.0.1";
const port = 3000;



app.get("/article/*", (req,res)=>{
    artiName = req.path.split("/")[2];
    dm("name",artiName);
    if (articles[artiName] == undefined) {res.send("404");}
    arti = articles[artiName];
    var artiBody = "";
    var artiPath = __dirname+"\\articles\\"+artiName+".md";
    dm("path: ", artiPath);
    fs.promises.readFile(artiPath)
    .then((data)=>{
        artiBody = converter.makeHtml(""+data);
        res.send(HTMLCreater({
            title: artiName,
            lang:indexLang,
            head: indexHead + indexCss,
            body: bodyHead + artiBodyUpper + artiBody + artiBodyLower + bodyEnd
        }))
    })
    .catch((err)=>{
        dm(err);
    })

});

app.get("/", function(req, res) {
    res.send(HTMLCreater({
        title:indexTitle,
        lang: indexLang,
        head: indexHead+indexCss,
        body: bodyHead + indexBodyUpper + indexBody + indexBodyLower + bodyEnd
    }))
    // ds(req.hostname);
    // res.sendFile(__dirname + "/doc" + "/index.html");
});

app.get("*", (req,res)=>{res.send("404");});


app.listen(port, hostname, function(){
    ds(`Server is listening at ${hostname}:${port}.`);

})

