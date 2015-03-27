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

function displayTwitterPosts(data){
    data.forEach(function(postStr){
        var postArr = postStr.split("\n").filter(function(v){
            return v.length > 0;
        });
        
        var content = postArr[0];
        var url = postArr[1];
        var date = postArr[2];
        
        var postElem = document.createElement("li");
        postElem.innerHTML = "<p>" + twttr.txt.autoLink(content) + "</p><a href='" + url + "'><date>" + date + "</date></a>";
        newsStream.appendChild(postElem);
    });
    [].slice.call(newsStream.querySelectorAll("a")).forEach(function(elem){
        elem.setAttribute("target", "_blank");
    });
    var twitterMsnry = new Masonry(newsStream, {
        itemSelector: "li",
        gutter: 20,
        isFitWidth: true
    });
}

if (
    localStorage.getItem("twitterStreamData") && 
    (new Date().getTime() - Number(localStorage.getItem("twitterStreamTime")) < 600000 /* 10 minutes */)
) {
    displayTwitterPosts(JSON.parse(localStorage.getItem("twitterStreamData")));
} else {
    xhr("https://dl.dropboxusercontent.com/u/57300365/SC%20Racers/Twitter/tweets.txt", function(r){
        r = r.split("\n \n ").reverse();
        if (r.length > 50) r.length = 50;

        localStorage.setItem("twitterStreamData", JSON.stringify(r));
        localStorage.setItem("twitterStreamTime", new Date().getTime().toString());

        displayTwitterPosts(r);
    });
}

/* background images from markup */

[].slice.call(document.querySelectorAll("[data-bg]")).forEach(function(elem){
    elem.style.backgroundImage = "url(" + elem.dataset.bg + ")";
});

/* section changing */

function changeSection(id){
    var section = document.querySelector("[data-id='" + id + "']");
    var link = document.querySelector("nav a[href='#" + id + "']");
    
    if (section) {
        [].slice.call(document.querySelectorAll("section")).forEach(function(elem){
            elem.classList.remove("current");
        });
        section.classList.add("current");
        document.querySelector(".content-container").style.height = section.offsetHeight + "px";
    } else {
        console.log("couldn't find section '" + id + "'");
    }
    
    if (link) {
        [].slice.call(document.querySelectorAll("nav a")).forEach(function(elem){
            elem.classList.remove("current");
        });
        link.classList.add("current");
    }
}

addEventListener("hashchange", function(){
    changeSection(location.hash.substring(1));
});

// check location hash on page load
if (location.hash.length > 1) {
    changeSection(location.hash.substring(1));
} else {
    changeSection(document.querySelector("section").dataset.id);
}

/* floaing nav bar */

var navOrigY = document.querySelector("nav").offsetTop;
setInterval(function(){
    if (window.scrollY >= navOrigY) {
        document.body.classList.add("float-nav");
    } else {
        document.body.classList.remove("float-nav");
    }
}, 50);