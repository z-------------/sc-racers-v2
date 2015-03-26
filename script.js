var xhr = function(url,callback) {
    var oReq = new XMLHttpRequest();
    oReq.onload = function(){
        var response = this.responseText;
        callback(response);
    };
    oReq.open("get", url, true);
    oReq.send();
};

var toAttrCase = function(string){
    string = string.toLowerCase();
    return string.replace(/[^\w]/g, "-").replace(/-$/g, "");
};

/* global element variables */

var newsStream = document.querySelector(".stream-container");

/* dynamic section names */

[].slice.call(document.querySelectorAll("nav a")).forEach(function(elem){
    elem.href = "#" + toAttrCase(elem.textContent);
});

[].slice.call(document.querySelectorAll("section")).forEach(function(elem){
    elem.dataset.id = toAttrCase(elem.querySelectorAll("h2")[0].textContent);
});

/* twitter stream */

xhr("https://dl.dropboxusercontent.com/u/57300365/SC%20Racers/Twitter/tweets.txt", function(r){
    var posts = [];
    r = r.split("\n \n ");
    r.forEach(function(postStr){
        var postArr = postStr.split("\n").filter(function(v){
            return v.length > 0;
        });
        
        var content = postArr[0];
        var url = postArr[1];
        var date = postArr[2];
        
        var postElem = document.createElement("li");
        postElem.innerHTML = "<p>" + content + "</p>";
        newsStream.appendChild(postElem);
    })
});