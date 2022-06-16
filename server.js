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

var indexArtiJSON = {};
var indexArti = {};

var indexKey = {};
var indexKeyJSON = {};

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

function autoSaveKey() {
    dj("save key")
    jsonfile.writeFile("indexKey.json", indexKeyJSON, {spaces:4}, (err)=>{
        if(err) {
            dj("auto save key:", err);
        }
    });
    setTimeout(autoSaveKey, 3600000);
}


jsonfile.readFile("indexKey.json")
    .then(obj => {
        dj("key index exist");

    })
    .catch(err => {
        if (err) {
            dj("catch", err)
            indexKey = {
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
            indexKeyJSON = {
                "name": "indexKey",
                "location": "./indexKeyJSON",
                "data":indexKey,
                "lastModifiedTime":timestamp("YYYY/MM/DD HH:mm:ss:ms UTC-4")
            }
            autoSaveKey();
        }
    })

jsonfile.readFile("indexArti.json")
    .then(obj =>{
        indexArtiJSON = obj;
        indexArti = indexArtiJSON["data"];
        dj("arti index exist")
        orderList = indexArti["orderList"];
        articles = indexArti["articles"];
        //dj("articles", articles);
        //dj("orderList", orderList)
        orderList.forEach(element => {
            //dj("element", articles[element["name"]])
            indexBody += "<p><a href=\"/article/" + element["aname"] + "\">" + indexArti["articles"][element["aname"]]["name"] +"</a><br><span>keywords: " + indexArti["articles"][element["aname"]]["keywords"] + "</span></p>";
        });
        indexBody += indexBodyLower;
        
    })
    .catch(err => {
        if (err) {
            dj("catch:",err)
            // test test.md
            testArti = {"name": "test", "keywords": ["test"], "filename":"test.md", "upload":"2022/06/15 23:30:10:100 UTC-4", "change":timestamp("YYYY/MM/DD HH:mm:ss:ms UTC-4")};
            var testArti2 = {"name": "test2", "keywords": ["test","test2"], "filename":"test2.md", "upload":"2022/06/15 23:30:10:100 UTC-4", "change":timestamp("YYYY/MM/DD HH:mm:ss:ms UTC-4")}
            indexArti["articles"] = {};
            indexArti["articles"]["test"]=testArti;
            indexArti["articles"]["test2"]=testArti2;
            indexArti["numArticles"] = 2;
            indexArti["orderList"] = [];
            indexArti["orderList"].push({"aid":1, "aname":"test"});
            indexArti["orderList"].push({"aid":2, "aname":"test2"});
            indexArtiJSON = {
                "name":"indexArti",
                "location": "./indexArti.json",
                "data": indexArti,
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

