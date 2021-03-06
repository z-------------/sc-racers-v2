/* constants */

var MEMBER_PHOTOS_DIR = "/assets/img/members/";
var GALLERY_RATIO = 16/9;

/* global functions */

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

/* section changing */

function sizeContentContainer(){
    var section = document.querySelector("section.current");
    document.querySelector(".content-container").style.height = section.offsetHeight + "px";
}

function changeSection(id){
    var section = document.querySelector("[data-id='" + id + "']");
    var link = document.querySelector("nav a[href='#" + id + "']");
    var sections = [].slice.call(document.querySelectorAll("section"));
    
    if (section) {
        sections.forEach(function(elem){
            elem.classList.remove("current");
            elem.classList.remove("left");
            elem.classList.remove("right");
            
            if (sections.indexOf(elem) < sections.indexOf(section)) {
                elem.classList.add("left");
            } else if (sections.indexOf(elem) > sections.indexOf(section)) {
                elem.classList.add("right");
            }
        });
        section.classList.add("current");
        
        sizeContentContainer();
        
        if (window.scrollY > navOrigY) window.scrollTo(0, navOrigY);
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
    sizeContentContainer();
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

/* gallery */

[].slice.call(document.querySelectorAll(".gallery-container")).forEach(function(container){
    container.style.height = window.innerWidth * 1/GALLERY_RATIO + "px";
    container.innerHTML += "<button class='gallery-control prev'></button><button class='gallery-control next'></button>";
    container.querySelector(".gallery-control.prev").classList.add("hidden");
    
    [].slice.call(container.querySelectorAll(".gallery-control")).forEach(function(elem){
        elem.addEventListener("click", function(){
            var direction = (elem.classList.contains("prev") ? -1 : 1);
            gallerySlide(container, direction);
        });
    });
    
    var imgElems = container.querySelectorAll("img");
    var imgs = [];
    
    [].slice.call(imgElems).forEach(function(imgElem, i){
        var title = imgElem.dataset.title;
        var description = imgElem.dataset.description;
        
        var elem = document.createElement("div");
        elem.classList.add("gallery-img");
        elem.dataset.bg = imgElem.src;
        
        if (i > 0) elem.classList.add("right");
        
        if (title || description) elem.innerHTML += "<div class='gallery-img-info'></div>";
        if (title) {
            elem.querySelector(".gallery-img-info").innerHTML += "<span class='gallery-img-title'>" + title + "</span>";
        }
        if (description) {
            elem.querySelector(".gallery-img-info").innerHTML += "<span class='gallery-img-description'>" + description + "</span>";
        }
        
        container.removeChild(imgElem);
        container.appendChild(elem);
        
        elem.style.height = parseInt(getComputedStyle(elem).getPropertyValue("width")) * 1/GALLERY_RATIO + "px";
        
        sizeContentContainer();
    });
});

function gallerySlide(galleryElem, direction){
    var i = direction || 1;
    var slides = [].slice.call(galleryElem.querySelectorAll(".gallery-img"));
    var currentSlide = slides.filter(function(elem){
        return !(elem.classList.contains("left") || elem.classList.contains("right"));
    })[0];
    var currentIndex = slides.indexOf(currentSlide);
    var newIndex = currentIndex + i;
    var futureSlide = slides[newIndex];
    if (futureSlide) {
        var newClass = (i === 1 ? "left" : "right");
        currentSlide.classList.add(newClass);
        futureSlide.classList.remove("left"); futureSlide.classList.remove("right");
        
        if (newIndex === 0) {
            galleryElem.querySelector(".gallery-control.prev").classList.add("hidden");
        } else {
            galleryElem.querySelector(".gallery-control.prev").classList.remove("hidden");
        }
        if (newIndex === slides.length - 1) {
            galleryElem.querySelector(".gallery-control.next").classList.add("hidden");
        } else {
            galleryElem.querySelector(".gallery-control.next").classList.remove("hidden");
        }
    }
}

/* background images from markup */

[].slice.call(document.querySelectorAll("[data-bg]")).forEach(function(elem){
    elem.style.backgroundImage = "url(" + elem.dataset.bg + ")";
});

/* floaing nav bar */

var navOrigY = document.querySelector("nav").offsetTop;
setInterval(function(){
    if (window.scrollY >= navOrigY) {
        document.body.classList.add("float-nav");
    } else {
        document.body.classList.remove("float-nav");
    }
}, 50);

/* dynamic member photos */

[].slice.call(document.querySelectorAll(".members-container li")).forEach(function(elem){
    var photoElem = elem.querySelector(".member-photo");
    var name = elem.querySelector(".member-name").textContent;
    
    photoElem.src = MEMBER_PHOTOS_DIR + name + ".jpg";
});

/* spinning logo on hover */

(function(){
    var logoElem = document.querySelector(".logo");
    logoElem.addEventListener("load", function(){
        var svgDoc = logoElem.contentDocument;
        var styleElem = svgDoc.createElementNS("http://www.w3.org/2000/svg", "style");

        styleElem.textContent = "#logo-rings {\
transform: rotate(0);\
transform-origin: 58.5% 50%;\
}\
svg:hover #logo-rings {\
transform: rotate(10turn);\
transition: transform 3s;\
}";
        svgDoc.querySelector("svg").appendChild(styleElem);
    });
})();