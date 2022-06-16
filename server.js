var mainHead = `
<meta charset="utf-8" name="viewport" content="width=device-width.initial-scale=1.0*">
`;

var mainCSS = `
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

#realcodecg {
    font-size: 100px;
    margin:0px;
}

.menuBarDiv {
    text-align: center;
    align-items: center;
}
</style>
`;

var mainLang = `en`;
var mainBodyUpper = `
<div class="bodyDiv">
    <div class="titleDiv">
        <h1 class="title" id="realcodecg">Real Code CG</span>
    </div>
    <div class="menuBarDiv">
        <span><a href="/">index</a>, <a href="/keywords">keywords search</a></span>
    </div>
`;

var mainBodyLower =`
</div>`;


// index page
var indexTitle = `Real Code CG Coding Blog`;
var indexBodyUpper = `
    <div class="indexDiv">
`;
var indexBody = ``;
var indexBodyLower = `
    </div>
`;

// article page
var artiTitle = indexTitle;
var artiBodyUpper = `
    <div class="articleDiv>
`;
var artiBodyLower = `
    </div>
`;

// key page
var keyTitle = indexTitle + `: key search`;
var keyCSS = `
<style>
.keyDiv {
    width:90%;
}
.keyTable{
    width:100%;
    border = 1px solid;
}
.keyRight {
    width:50%;
}
.keyLeft {
    width:50%;
}
.keySearchDiv {
    width: 100%;
}
</style>
`;
var keyBodyUpper = `
    <div class="keyDiv">
        <table class="keyTable">
            <tr>
`;
var keyBody = ``;
var keyBodyLower = `
            </tr>
        </table>
    </div>
`;

// key search page
var keySearchTitle = "keysearch";
var keySearchCSS = `
<style>
body {
    background-color: #10151b;
    color: rgb(237,237,237);
    z-index: -10;
    align-items: center;
}
</style>
`;
var keySearchBodyUpper = ``;
var keySearchBody = `teststeasafsdfas`;
var keySearchBodyLower = ``;

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
const { diffieHellman } = require("crypto");

var artiIndexJSON = {};
var artiIndex = {};
var articles = {};
var artiOrder = [];
var numArticles = 0;

var keyIndexJSON = {};
var keyIndex = {};
var keys = {};
var numKeys = 0;
var keyOrder = [];

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
        keys = keyIndex["keys"];
        numKeys = keyIndex["numKeys"];
        keyOrder = keyIndex["keyOrder"];
        keyBody = ``;
        // add left column for key list
        keyBody += `<td class="keyLeft"><div class="keyListDiv">\n`;
        keyOrder.forEach(element=>{
            var kname = element["kname"];
            keyBody += `<p>${kname}</p>\n`
        })
        keyBody += `</div></td>`;
        // add right column
        keyBody += `<td class="keyRight"><div class="keySearchDiv">\n`;
        keyBody += `<iframe src="/keysearch?" title="keysearch" class="keySearchIframe" name="searchResult">iframe<iframe>`
        keyBody += `</div></td>`
        dj("key index read");
    })
    .catch(err => {
        if (err) {
            if (err["errno"] != -4058) {
                dj("read arti catch:",err)
            }
            keys = {
                "test": ["test","test2"],
                "test2": ["test2"]
            };
            numKeys = 2;
            keyOrder = [
                {
                    "kid":1,
                    "kname":"test"
                },
                {
                    "kid":2,
                    "kname":"test2"
                }
            ];
            keyIndex = {
                "keys": keys,
                "numKeys":numKeys,
                "keyOrder": keyOrder
            }
            keyIndexJSON = {
                "name": "keyIndex",
                "location": "./keyIndex.json",
                "data":keyIndex,
                "lastModifiedTime":timestamp("YYYY/MM/DD HH:mm:ss:ms UTC-4")
            }
            dj("created key index")
            autoSaveKey();
        }
    })

jsonfile.readFile("artiIndex.json")
    .then(obj =>{
        artiIndexJSON = obj;
        artiIndex = artiIndexJSON["data"];
        articles = artiIndex["articles"];
        artiOrder = artiIndex["artiOrder"];
        numArticles = artiIndex["numArticles"];
        //dj("articles", articles);
        //dj("orderList", orderList)
        indexBody = ""
        artiOrder.forEach(element => {
            //dj("element", articles[element["name"]])
            aname = element["aname"]
            indexBody += 
                "<p><a href=\"/article/" + aname + "\">" 
                + aname +"</a><br><span>keywords: " 
                + articles[aname]["keywords"] 
                + "</span></p>\n";
        });
        //dt(indexBody);
        dj("arti index read")
    })
    .catch(err => {
        if (err) {
            if (err["errno"] != -4058) {
                dj("read arti catch:",err)
            }
            // test test.md
            testArti = {"name": "test", "keywords": ["test"], "filename":"test.md", "upload":"2022/06/15 23:30:10:100 UTC-4", "change":timestamp("YYYY/MM/DD HH:mm:ss:ms UTC-4")};
            var testArti2 = {"name": "test2", "keywords": ["test","test2"], "filename":"test2.md", "upload":"2022/06/15 23:30:10:100 UTC-4", "change":timestamp("YYYY/MM/DD HH:mm:ss:ms UTC-4")}
            articles = {};
            articles["test"]=testArti;
            articles["test2"]=testArti2;
            artiOrder = [];
            artiOrder.push({"aid":1, "aname":"test"});
            artiOrder.push({"aid":2, "aname":"test2"});
            numArticles = 2;
            artiIndex = {
                "articles": articles,
                "numArticles": numArticles,
                "artiOrder":artiOrder
            }
            artiIndexJSON = {
                "name":"artiIndex",
                "location": "./artiIndex.json",
                "data": artiIndex,
                "lastModifiedTime":timestamp("YYYY/MM/DD HH:mm:ss:ms UTC-4")
            }
            dj("created test arti index");
            autoSaveArti();
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
            title: artiTitle + ": " + artiName,
            lang: mainLang,
            head: mainHead + mainCSS,
            body: mainBodyUpper + artiBodyUpper + artiBody + artiBodyLower + mainBodyLower
        }))
    })
    .catch((err)=>{
        dm(err);
    })

});

app.get("/keywords", (req,res)=>{
    res.send(HTMLCreater({
        title: keyTitle,
        lang: mainLang,
        head: mainHead + mainCSS + keyCSS,
        body: mainBodyUpper + keyBodyUpper + keyBody + keyBodyLower + mainBodyLower
    }))
})

app.get("/keysearch*", (req,res)=>{
    res.send(HTMLCreater({
        title: keySearchTitle,
        lang: mainLang,
        head: mainHead + keySearchCSS,
        body: keySearchBodyUpper + keySearchBody + keySearchBodyLower
    }))
})

app.get("/", function(req, res) {
    res.send(HTMLCreater({
        title:indexTitle,
        lang: mainLang,
        head: mainHead+mainCSS,
        body: mainBodyUpper + indexBodyUpper + indexBody + indexBodyLower + mainBodyLower
    }))
    // ds(req.hostname);
    // res.sendFile(__dirname + "/doc" + "/index.html");
});

app.get("*", (req,res)=>{res.send("404");});


app.listen(port, hostname, function(){
    ds(`Server is listening at ${hostname}:${port}.`);

})

