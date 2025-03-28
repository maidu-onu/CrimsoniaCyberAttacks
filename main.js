"use strict";
import {
  loadSVG,
  randomInt,
  bendRandom,
  getRandomRGB,
  addCSS,
  cssRuleSelector,
} from "./support.js";

import {
  citiesBerylia,
  citiesCrimsonia,
  citiesRevalia,
  citiesNetoria,
  countries,
  cities,
  attackDesc,
  descLvl1,
  descLvl2,
  descLvl3,
} from "./data.js";

import { setTimeBetween, setRandomInterval } from "./settings.js";
///CONFIG///
const signalDuration = 2500;
let isTabActive = true;
/* let activeSignals = [
  "path_001" 
];   */
let stoppedSignals = [];
let pathIdCount = 1; // naming new paths as path_001 etc.
let latestPath;
let mapSvg;
let animationSvg;

const map = function () {
  // only after map exists
  mapSvg = document.getElementById("map");
};

const animation = function () {
  animationSvg = document.getElementById("animationSVG");
};

//NAME PATHS by type "path", "circle"
const pathName = function (type) {
  return `${type}_${String(pathIdCount).padStart(1, "0")}`;
};

///////// MAKE PATH ////////////

const makePath = function (x1, y1, x2, y2, color = 1, bend = 0, animate = 1) {
  const xhalf = (x2 - x1) / 2;
  const yhalf = (y2 - y1) / 2;
  const xbend = xhalf - bend * yhalf;
  const ybend = yhalf + bend * xhalf;

  let direction;
  if (Math.abs(xhalf) >= Math.abs(yhalf)) {
    xhalf > 0 ? (direction = `right${color}`) : (direction = `left${color}`);
  } else {
    yhalf > 0 ? (direction = `down${color}`) : (direction = `up${color}`);
  }

  document.querySelector("#animationSVG").insertAdjacentHTML(
    "afterbegin",
    ` <path
          id=${pathName("path")}
          class=${direction /*  + (Math.floor(Math.random() * 5) + 1) */} 
          d="m${x1},${y1}s${xbend},${ybend},${x2 - x1},${y2 - y1}"
        />
        <circle id=${pathName(
          "circle"
        )} class="circle${color}" cx="${x2}" cy="${y2}" />
`
  );

  //animate = 1 ? activeSignals.push(pathName("path")) : "";
  latestPath = pathName("path");
  pathIdCount++;
};

const getCoordsById = function (id) {
  const bbox1 = document.getElementById(id).getBBox();
  const centerX1 = bbox1.x + bbox1.width / 2;
  const centerY1 = bbox1.y + bbox1.height / 2;
  const center = [centerX1, centerY1];
  return center;
};
////////////////// PATH by ID //////////////////
//makes paths from object to object - uses makePath//
const makePathByID = function (id1, id2, color, bend = bendRandom(1)) {
  makePath(
    getCoordsById(id1)[0],
    getCoordsById(id1)[1],
    getCoordsById(id2)[0],
    getCoordsById(id2)[1],
    color,
    bend
  );
};
const removePath = function (pathID) {
  animationSvg.removeChild(document.getElementById(pathID));
};
/////// CLICK MAKE PATH /////// - uses makePath
let clickX;
let clickY;
let clickNum = 0;
let svgX;
let svgY;

const mapClick = function () {
  // its function because the need for await

  mapSvg.addEventListener("click", function (event) {
    let matrix = mapSvg.getScreenCTM().inverse(); // Get inverse transform matrix
    svgX = matrix.a * event.clientX + matrix.e;
    svgY = matrix.d * event.clientY + matrix.f;
    clickNum++;

    if (clickNum === 2) {
      makePath(
        clickX,
        clickY,
        svgX,
        svgY,
        randomInt(2),
        (Math.random() - 0.5) * 4
      );
      signal(latestPath);
      clickNum = 0;
    }
    clickX = svgX;
    clickY = svgY;
    console.log("Mouse clicked at:", svgX, svgY);

    //randomSignal(latestPath);
  });
};

//// SIGNAL //// Function that creates line and circular explosion signal after
const signal = function (pathName, delay = 0) {
  let timeline = anime.timeline({
    loop: false,
    direction: "normal",
  });
  const svgPath = document.querySelector(`#${pathName}`);
  var pathLength = svgPath.getTotalLength();
  svgPath.style.visibility = "visible";
  timeline.add({
    targets: svgPath,
    strokeDashoffset: [anime.setDashoffset, -pathLength],
    easing: "easeInOutSine",
    duration: signalDuration,
    delay: delay,
  });

  timeline.add(
    {
      targets: `#${pathName.replace("path", "circle")}`, // creates circle_ with same suffix as path
      opacity: 1,
      scale: [0, 20, 0], // Animate from 1 to 20 and back to 1
      duration: 1200, // Duration for each animation cycle
      //direction: "alternate", // Alternate between scaling up and down
      easing: "easeOutSine",
    },
    `-=${signalDuration * 0.6}`
  );
};

//It restarts signals once tab is visible
//Only signals in stopped Signlas list

document.addEventListener("visibilitychange", () => {
  isTabActive = !document.hidden;
  if (isTabActive) {
    pathIdCount = 1;
    //timeBetween = 0; //remove delay that is between repeating signals
    stoppedSignals.forEach((param) => {
      randomSignal(param[0], param[1], param[2], param[3]);
    });
    stoppedSignals = [];
  }
});

////// RANDOM SIGNAL ////////
//makes signal appear at intervals
const randomTime = function (max) {
  return Math.floor(Math.random() * max);
};
const makeRandomInterval = function () {
  return randomTime(setRandomInterval);
};

const randomSignal = function (id1, id2, color, bend, lifeTime = 0) {
  let lastTime = Date.now();
  let randomInterval = makeRandomInterval() * 0.5; //this needs to be outside of interval, first interval is smaller
  //console.log(randomInterval);
  let timeCounter = 0;
  let timeBetween = 0;
  let pathName;
  let city1 = id1;
  let city2 = id2;
  let interval1 = setInterval(() => {
    if (timeCounter > lifeTime) {
      return;
    }
    /*  console.log(`timebetween on  ${timeBetween}`);
    console.log(randomInterval + timeBetween);
    console.log(`timeleft ${Date.now() - lastTime}`); */
    if (!isTabActive) {
      clearInterval(interval1);
      console.log("stop"); // clears interval after tab hidden
      stoppedSignals.push([id1, id2, color, bend]); // adds signals to stoppedSignals array for later restart
      //removePath(pathName);
      //removePath(`#${pathName.replace("path", "circle")}`);
      console.log(stoppedSignals);
      return;
    }
    if (Date.now() > lastTime + randomInterval + timeBetween) {
      // timebetween is 0 at the very start
      lastTime = Date.now();
      lifeTime ? timeCounter++ : "";

      timeBetween = setTimeBetween;
      randomInterval = makeRandomInterval(); //new random time
      //console.log(randomInterval);
      let city1 = id1;
      let city2 = id2;
      if (countries.includes(id1)) {
        // if id is named after country name(from array) then it will be random city from that country each time attack is run
        city1 = randomCity(id1);
      }
      if (countries.includes(id2)) {
        city2 = randomCity(id2);
      }
      attack(city1, city2, color, bend);
    }
  }, 100);
};

const showLabel = function (
  id,
  appear = 10,
  fadeAway = 2000,
  xoffset = 3,
  yoffset = -10
) {
  const who = citiesCrimsonia.includes(id) ? "attacker" : "attacked";

  setTimeout(() => {
    document.querySelector("#animationSVG").insertAdjacentHTML(
      "afterbegin",
      ` <text class=${who} x="${getCoordsById(id)[0] + xoffset}" y="${
        getCoordsById(id)[1] - yoffset
      }">${id}</text>
`
    );
    const textElement = document.querySelector(`.${who}`);
    setTimeout(() => {
      if (textElement) {
        textElement.classList.add("fadeout");
      }
    }, fadeAway);
    setTimeout(() => {
      if (textElement) {
        textElement.remove();
      }
    }, 5000);
  }, appear);
};

const attack = function (id1, id2, color, bend = 1) {
  makePathByID(id1, id2, color, bendRandom(bend));
  //console.log("Created " + latestPath);
  signal(latestPath);
  showLabel(id1, 10, 1000, 7, -25);
  showLabel(id2, 1000, 2000, 5, 5);
  attackLog(
    color,
    attackDesc[color - 1][randomInt(attackDesc[0].length) - 1],
    id1,
    id2
  );
  //console.log("signalled " + latestPath);
  const thislatestPath = latestPath;
  setTimeout(function () {
    if (document.getElementById(thislatestPath)) {
      removePath(thislatestPath);
      //  console.log("deleted " + thislatestPath);
    }
    //console.log(latestPath + " " + thislatestPath);
    if (
      document.getElementById(`${thislatestPath.replace("path", "circle")}`)
    ) {
      removePath(`${thislatestPath.replace("path", "circle")}`);
    }
  }, signalDuration);
};

//All animation paths visible from beginning
/* cssRuleSelector(".up", "visibility", "visible");
cssRuleSelector(".right", "visibility", "visible");
cssRuleSelector(".left", "visibility", "visible");
cssRuleSelector(".down", "visibility", "visible"); */

// function to load main code
/* const hoverLand = function (){
  const 
}
 */
const landHover = function () {
  const landSquare = document.getElementById("land_square");
  //console.log(landSquare.firstElementChild.classList[0]);
  addCSS(
    `.${landSquare.firstElementChild.classList[0]}:hover`, //checks the name of the class that SVG automatically assigns to square element
    `fill:rgb(35, 177, 243);transition:none;
    filter: drop-shadow(0 0 5px rgba(0, 255, 255, 1))drop-shadow(0 0 5px rgba(0, 255, 255, 1));`
  );
  addCSS(
    `.${landSquare.firstElementChild.classList[0]}`,
    `
  transition: all 2s ease-out;
  stroke:red;
  
  stroke-width: 2px !important;
  stroke-opacity:0;
  pointer-events: stroke;

  `
  );
};

const randomCity = function (attCountry = "random") {
  let city;
  attCountry === "Berylia"
    ? (city = citiesBerylia[randomInt(citiesBerylia.length) - 1])
    : "";
  attCountry === "Crimsonia"
    ? (city = citiesCrimsonia[randomInt(citiesCrimsonia.length) - 1])
    : "";
  attCountry === "Revalia"
    ? (city = citiesRevalia[randomInt(citiesRevalia.length) - 1])
    : "";
  attCountry === "Netoria"
    ? (city = citiesNetoria[randomInt(citiesNetoria.length) - 1])
    : "";
  attCountry === "random" ? (city = cities[randomInt(cities.length) - 1]) : "";
  return city;
};

const attackLog = function (threatLevel = 2, description, attacker, defender) {
  const html = `<div class="log-event">
  <div class="threat-circle-${threatLevel}"></div>
      <div class="log-content">
          <div class="log-title">${description}
          </div>
          <div class="log-details">
              <div class="log-time"><img src="./SVG/clock.svg" class="log-time-icon">
              <span class="time">${new Date().toLocaleTimeString(
                "en-GB"
              )}</span></div>
              <div class="log-city">
              <span>${attacker}</span></div>
              <div class="log-arrow-${threatLevel}"></div>
              <div class="log-city">
             
              <span>${defender}</span></div>
            
          </div>       
      </div>
      </div>`;
  const elements = document.getElementsByClassName("log-event");
  const log = document.getElementById("log");
  elements.length >= 10 ? log.removeChild(log.lastElementChild) : "";
  log.insertAdjacentHTML("afterbegin", html);
};

async function initialize() {
  try {
    /////////////ALL GRAPHICAL STUFF//////////////
    await loadSVG("map", "mapContainer");
    await map(); //defines map svg object as const
    await animation(); //defines animationSVG as const
    landHover(); // cursor hover effect over land

    mapClick(); //eventListener for clicking on map
    randomSignal("Crimsonia", "Berylia", randomInt(1), 0.7);
    randomSignal("Crimsonia", "Berylia", randomInt(1), 0.7);
    randomSignal("Crimsonia", "Berylia", randomInt(1), 0.7);
    randomSignal("Crimsonia", "Berylia", randomInt(1), 0.7);
    randomSignal("Crimsonia", "Berylia", randomInt(1), 0.7);
    randomSignal("Crimsonia", "Berylia", randomInt(1), 0.7);
    randomSignal("Crimsonia", "Berylia", randomInt(1), 0.7);
    randomSignal("Crimsonia", "Berylia", 2, 0.7);
    randomSignal("Crimsonia", "Berylia", 2, 0.7);
    randomSignal("Crimsonia", "Berylia", 2, 0.7);
    randomSignal("Crimsonia", "Berylia", 2, 0.7);
    randomSignal("Crimsonia", "Berylia", 3, 0.7);
    randomSignal("Crimsonia", "Netoria", randomInt(3), 0.7);
    //activeSignals.forEach(randomSignal);
    ////////////////////////////////////////////////
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}

//load main code above
document.addEventListener("DOMContentLoaded", initialize);
