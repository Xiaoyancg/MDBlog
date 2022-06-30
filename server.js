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
var keyScript = `
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>\n
<script>

var searchArray = [];
var numKey = 0;
kv = {}
function qsMaker(data) {
    const ret = [];
    for (let d in data) {
        ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    }
    return ret.join("&").toString;
}

$(document).ready(function(){
    qString = window.location.search;
    qString = qString.substring(1);
    kvStringList = qString.split("&");
    for (i = 0, kvl = kvStringList.length; i < kvl; i++) {
        kvString = kvStringList[i].split("=");
        kv[decodeURIComponent(kvString[0])] = decodeURIComponent(kvString[1]);
    }
    numKey = kv["numKey"]
    for (i = 0; i < numKey; i ++) {
        addKey(kv["key"+i.toString()]);
    }
    $(".keyLink").click(function(){
        addKey(event.target.innerHTML);
    })
    $("#searchBut").click(function() {
        numKey = searchArray.length
        curpath = location.pathname
        qpath = curpath + "?"
        qpath += "numKey" + "=" + numKey;
        for (let k in searchArray) {
            qpath += "&key" + encodeURIComponent(k.toString()) + "=" + encodeURIComponent(searchArray[k].toString());
        }
        console.log(qpath);
        //window.open(qpath,"_self")
        window.location.href = qpath;
    })
});

function addKey(key) {
    var exist = false;
    for (var i = 0; i < searchArray.length; i++) {
        if (searchArray[i] == key) {
            searchArray.splice(i,1);
            exist = true;
            numKey -= 1;
            break;
        }
    }
    if (!exist) {
        searchArray.push(key);
        numKey += 1;
    }
    var searchString = "";
    for (var i = 0; i < searchArray.length; i++) {
        searchString += searchArray[i];
        if (i != searchArray.length - 1) {
            searchString += ", ";
        }
    }
    
    $("#searchArray").text("searching keys: " + searchString);
}
</script>
`;

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
var keyBodyLeft = ``;
var keyBodyRight = ``;
var keyBodyLower = `
            </tr>
        </table>
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

const HTMLCreator = require("create-html");
var showdown  = require('showdown');
var converter = new showdown.Converter();

const jsonfile = require("jsonfile");
const fs = require("fs");
const util = require("util");
const timestamp = require('time-stamp');
const { diffieHellman } = require("crypto");
const { TextDecoderStream } = require("stream/web");
const internal = require("stream");

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


jsonfile.readFile("artiIndex.json")
    .then(obj =>{
        artiIndexJSON = obj;
        artiIndex = artiIndexJSON["data"];
        articles = artiIndex["articles"];
        artiOrder = artiIndex["artiOrder"];
        numArticles = artiIndex["numArticles"];
        //dj("articles", articles);
        //dj("orderList", orderList)

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


    jsonfile.readFile("keyIndex.json")
    .then(obj => {
        keyIndexJSON = obj;
        keyIndex = keyIndexJSON["data"];
        keys = keyIndex["keys"];
        numKeys = keyIndex["numKeys"];
        keyOrder = keyIndex["keyOrder"];

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
        res.send(HTMLCreator({
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

app.get("/keywords?*", (req,res)=>{

    // add left column for key list
    keyBodyLeft = ``;
    keyBodyLeft += `<td class="keyLeft">`;
    keyBodyLeft += `\n<p><span id="searchArray">searching keys: </span><br><button id="searchBut">Search</button></p>\n`;
    keyBodyLeft += `<div class="keyListDiv">\n`;
    keyOrder.forEach(element=>{
        var kname = element["kname"];
        keyBodyLeft += `<p><button class="keyLink" id="but_${kname}")>${kname}</button></p>\n`
    })
    keyBodyLeft += `</div></td>`;
    // add right column

    if (req.query["numKey"] != undefined) {
        numSearchKey = req.query["numKey"];
    }
    else {
        numSearchKey = 0
    }
    ds("numSearchKey: %d", numSearchKey);
    searchKey = [];

    keyBodyRight = ``;
    keyBodyRight += `<td class="keyRight"><div class="keySearchDiv">\n`;
    // give up on in-page search design
    // ---keyBody += `<iframe src="/keySearch?" title="keySearch" class="keySearchIframe" name="searchResult">iframe<iframe>`---
    // default show all articles
    if (numSearchKey == 0) {
        artiOrder.forEach(element => {
        aname = element["aname"]
        keyBodyRight += 
            "<p><a href=\"/article/" + aname + "\">" 
            + aname +"</a><br><span>keywords: " 
            + articles[aname]["keywords"] 
            + "</span></p>\n";
        });
    }
    var searchResult = {}
    var searchedArti = []
    for (ki = 0; ki < numSearchKey; ki++) {
        tk = req.query["key" + ki.toString()];
        searchKey.push(tk);
        
        // loop keys for articles of temp key
        keys[tk].forEach(element => {
            if (searchResult[element] == undefined) {
                searchResult[element] = 1;
                searchedArti.push(element);
            }
            else {
                searchResult[element] += 1;
            }
        });
    }
    // loop search result to find articles that have all keys
    searchedArti.forEach(aname => {
        if (searchResult[aname] == numSearchKey) {
            keyBodyRight += 
                "<p><a href=\"/article/" + aname + "\">" 
                + aname +"</a><br><span>keywords: " 
                + articles[aname]["keywords"] 
                + "</span></p>\n";
        }
    })
    keyBodyRight += `</div></td>`
    ds(searchKey);
    res.send(HTMLCreator({
        title: keyTitle,
        lang: mainLang,
        head: mainHead + mainCSS + keyCSS + keyScript,
        body: mainBodyUpper + keyBodyUpper + keyBodyLeft + keyBodyRight + keyBodyLower + mainBodyLower
    }))
    

    
})

app.get("/", function(req, res) {
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
    res.send(HTMLCreator({
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

