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
  testData,
  btAttackDesc,
  btExploits,
  btPhising,
  btMalware,
} from "./data.js";

import {
  setTimeBetween,
  setRandomInterval,
  signalDuration,
} from "./settings.js";

import API from "./api.js";

///CONFIG///

let isTabActive = true;
/* let activeSignals = [
  "path_001" 
];   */
let stoppedSignals = [];
let pathIdCount = 1; // naming new paths as path_001 etc
let latestPath;
let mapSvg;
let animationSvg;
let gapInRealAttacks = 0;
let stopMarker = 0;
let fill = 1;

const urlParams = new URLSearchParams(window.location.search);
urlParams.get("fill") === "0" ? (fill = 0) : (fill = 1);
const realDist = function () {
  const attackDist = [1, 1, 1, 1, 2, 2, 3];
  return attackDist[randomInt(attackDist.length - 1)];
};

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
const signal = function (pathName, circle = 1, durationMod = 1) {
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
    duration: signalDuration * durationMod,
    delay: 0,
  });
  if (circle === 1) {
    // circle is created at the end of path
    timeline.add(
      {
        targets: `#${pathName.replace("path", "circle")}`, // animates circle_ with same suffix as path
        opacity: 1,
        scale: [0, 20, 0], // Animate from 1 to 20 and back to 1
        duration: 1200, // Duration for each animation cycle
        //direction: "alternate", // Alternate between scaling up and down
        easing: "easeOutSine",
      },
      `-=${signalDuration * durationMod * 0.6}`
    );
  }
  if (circle === 2) {
    //predrawn circle animates at the end of the path
    timeline.add(
      {
        targets: `#${pathName}_circle`, // animates circle_ with same suffix as path
        opacity: 1,
        scale: [0, 20, 0], // Animate from 1 to 20 and back to 1
        duration: 1200, // Duration for each animation cycle
        //direction: "alternate", // Alternate between scaling up and down
        easing: "easeOutSine",
      },
      `-=${signalDuration * durationMod * 0.6}`
    );
  }
};

//It restarts signals once tab is visible
//Only signals in stopped Signlas list

document.addEventListener("visibilitychange", () => {
  isTabActive = !document.hidden;
  if (isTabActive) {
    pathIdCount = 1;
    //timeBetween = 0; //remove delay that is between repeating signals
    stoppedSignals.forEach((param) => {
      randomSignal(
        param[0],
        param[1],
        param[2],
        param[3],
        param[4],
        param[5],
        param[6]
      );
    });
    stoppedSignals = [];
  }
});

////// RANDOM SIGNAL ////////
//makes signal appear at intervals
const randomTime = function (max) {
  return Math.floor(Math.random() * max);
};
/* const makeRandomInterval = function () {
  return randomTime(setRandomInterval);
}; */

const randomSignal = function (
  id1,
  id2,
  color = randomInt(3),
  bend = 1,
  interval = setRandomInterval,
  durationMod = 1 //how fast animation happens
) {
  let lastTime = Date.now();
  let randomInterval = randomTime(interval);
  //console.log(randomInterval);
  let timeCounter = 0;
  let timeBetween = 1500;
  let pathName;
  let city1 = id1;
  let city2 = id2;
  let interval1 = setInterval(() => {
    if (gapInRealAttacks === 0) {
      clearInterval(interval1);
      stopMarker = 0;
    }
    /*  console.log(`timebetween on  ${timeBetween}`);
    console.log(randomInterval + timeBetween);
    console.log(`timeleft ${Date.now() - lastTime}`); */
    if (!isTabActive) {
      clearInterval(interval1);
      //console.log("stop"); // clears interval after tab hidden
      stoppedSignals.push([id1, id2, color, bend, interval, durationMod]); // adds signals to stoppedSignals array for later restart
      //removePath(pathName);
      //removePath(`#${pathName.replace("path", "circle")}`);
      //console.log(stoppedSignals);
      return;
    }
    /*     if (gapInRealAttacks === 1 && stoppedSignals.length > 0) {
      isTabActive = !document.hidden;
      if (isTabActive) {
        pathIdCount = 1;
        //timeBetween = 0; //remove delay that is between repeating signals
        stoppedSignals.forEach((param) => {
          randomSignal(
            param[0],
            param[1],
            param[2],
            param[3],
            param[4],
            param[5],
            param[6]
          );
        });
        stoppedSignals = [];
      }
    } */
    if (Date.now() > lastTime + randomInterval + timeBetween) {
      // timebetween is 0 at the very start
      lastTime = Date.now();

      timeBetween = setTimeBetween;
      randomInterval = randomTime(interval) + signalDuration * durationMod; //new random time
      //console.log(randomInterval);
      let city1 = id1;
      let city2 = id2;
      if (countries.includes(id1)) {
        // if id is named after country name(from array) then it will be random city from that country each time attack is run
        city1 = randomCity(id1);
        while (city1 === "West_Point") {
          city1 = randomCity(id1);
        }
      }
      if (countries.includes(id2)) {
        city2 = randomCity(id2);
      }
      if (city2 !== 0 && gapInRealAttacks === 1) {
        // some predrawn attacks have id2=0
        attack(city1, city2, color, bend); //business as usual;
        if (countries.includes(id2) && randomInt(10) === 10) {
          //sometimes attacks spread/split inside target country
          setTimeout(() => {
            for (let i = 0; i < randomInt(2) + 1; i++) {
              attack(city2, randomCity(id2), color, bend, 0);
            }
          }, signalDuration * durationMod - 1500);
        }
      } else if (gapInRealAttacks === 1) {
        // predrawn paths
        const element = document.getElementById(id1);
        const circle = document.getElementById(`${id1}_circle`);
        element.classList.remove(...element.classList); // empty classlist of path
        if (circle) {
          circle.classList.remove(...circle.classList);
          circle.classList.add(`circle${color}`);
          circle.removeAttribute("r");
        }
        element.classList.add(`up${color}`); // if layer ID ends with _w there will be no circle at the end of the path, but water splash
        if (id1.slice(-2) == "_w") {
          showLabel("West_Point", 10, 1000, 7, -25, "West Point");
          signal(id1, 0, durationMod);
          const splash = 50;
          ///
          setTimeout(() => {
            document.querySelector("#animationSVG").insertAdjacentHTML(
              "afterbegin",
              ` <image class="splash" width="${splash}px" x="${
                getCoordsById(`${city1}_circle`)[0] - splash * 0.47
              }" y="${
                getCoordsById(`${city1}_circle`)[1] - splash * 0.7
              }" href=./SVG/splash.gif>
          `
            );
            setTimeout(() => {
              if (document.querySelector(".splash")) {
                animationSvg.removeChild(document.querySelector(".splash"));
              }
            }, 1000);
          }, signalDuration * durationMod * 0.5);

          attackLog(
            color,
            attackDesc[color - 1][randomInt(attackDesc[0].length) - 1],
            "West Point",
            "..."
          );
        } else {
          attackLog(
            color,
            attackDesc[color - 1][randomInt(attackDesc[0].length) - 1],
            "West Point",
            "West Point"
          );
          showLabel("West_Point", 10, 1000, 7, -25, "West Point");
          signal(id1, 2, durationMod);
        } // second parameter must be 2 if it is predrawn path;
      } // if second id is 0 it wont be animation between two ID-s, but one pre-drawn line.
    }
  }, 300);
};

const showLabel = function (
  id,
  appear = 10,
  fadeAway = 2000,
  xoffset = 3,
  yoffset = -10,
  customID
) {
  let who =
    citiesCrimsonia.includes(id) || id === "West_Point"
      ? "attacker"
      : "attacked";
  let labelText;
  if (customID) {
    labelText = customID;
  } else if (id.toLowerCase().startsWith("bt")) {
    who = "bt";
    labelText = id.toUpperCase().replace(/([A-Z]+)(\d+)/, "$1 $2");
  } else {
    labelText = id;
  }
  setTimeout(() => {
    document.querySelector("#animationSVG").insertAdjacentHTML(
      "afterbegin",
      ` <text class=${who} x="${getCoordsById(id)[0] + xoffset}" y="${
        getCoordsById(id)[1] - yoffset
      }">${labelText}</text>
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

let level1 = 0;
let level2 = 0;
let level3 = 0;

const attack = function (id1, id2, color, bend = 1, log = 1) {
  color === 1 ? level1++ : "";
  color === 2 ? level2++ : "";
  color === 3 ? level3++ : "";
  //console.log(level1+", "+level2+", "+level3);

  makePathByID(id1, id2, color, bendRandom(bend));
  //console.log("Created " + latestPath);
  const element = document.querySelector(`#${id1}`);
  element.classList.add("ease", "start-glow");
  setTimeout(() => {
    element.classList.toggle("start-glow");
  }, 400);
  signal(latestPath);
  if (log === 1) {
    showLabel(id1, 10, 1000, 7, -25);
  }
  showLabel(id2, 1000, 2000, 5, 5);
  if (log === 1) {
    attackLog(
      color,
      attackDesc[color - 1][randomInt(attackDesc[0].length) - 1],
      id1,
      id2
    );
  } else if (log != 0) {
    attackLog(
      color,
      btAttackDesc[color - 1][randomInt(attackDesc[0].length) - 1] + " " + log,
      id1,
      id2.toUpperCase().replace(/([A-Z]+)(\d+)/, "$1 $2")
    );
  }
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
  attCountry === "berylia"
    ? (city = citiesBerylia[randomInt(citiesBerylia.length) - 1])
    : "";
  attCountry === "crimsonia"
    ? (city = citiesCrimsonia[randomInt(citiesCrimsonia.length) - 1])
    : "";
  attCountry === "revalia"
    ? (city = citiesRevalia[randomInt(citiesRevalia.length) - 1])
    : "";
  attCountry === "netoria"
    ? (city = citiesNetoria[randomInt(citiesNetoria.length) - 1])
    : "";
  attCountry === "random" ? (city = cities[randomInt(cities.length) - 1]) : "";
  return city;
};

const attackLog = function (threatLevel = 2, description, attacker, defender) {
  let klingon = "log-title";
  if (!defender.toLowerCase().startsWith("bt")) {
    randomInt(14) === 14 ? (klingon = "log-title-klingon") : "";
  } else {
    klingon = "log-title";
  }

  const html = `<div class="log-event">
  <div class="threat-circle-${threatLevel}"></div>
      <div class="log-content">
          <div class="${klingon}"}>${description}
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
             
              <span class="${
                defender.toLowerCase().startsWith("bt") ? "bt_defender" : ""
              }">${defender}</span></div>
            
          </div>       
      </div>
      </div>`;
  const elements = document.getElementsByClassName("log-event");
  const log = document.getElementById("log");
  elements.length >= 10 ? log.removeChild(log.lastElementChild) : "";
  log.insertAdjacentHTML("afterbegin", html);
};
////////////////////////////
////////// API /////////////
////////////////////////////
let datas = {};

async function attacksAPI() {
  let api = new API();
  let team = "all";
  let test;
  urlParams.get("test") === "1" ? (test = 1) : (test = 0);
  if (test === 0) {
    datas = (await api.getData(team)) || {};
  }

  if (!datas.arrows || datas.arrows.length === 0) {
    gapInRealAttacks = 1;
  } else {
    gapInRealAttacks = 0;
  }

  let events = datas.arrows;
  let eventNo = 0;
  /////SETTINGS///
  // turn test data from data.js on/off
  let refreshInterval = 1800000; // how often it looks for new data from server
  let gapSizeToFill = 10000; // Simulated attacks start when gap of this size is detected  between real attacks

  if (test === 1) {
    // testData is in data.js
    refreshInterval = 30000;
    events = testData;
  }

  urlParams.get("refresh")
    ? (refreshInterval = urlParams.get("refresh") * 1000)
    : "";

  //console.log("test is " +test);
  /* events.forEach((data) => {
    data.end = data.end.toUpperCase().replace(/([A-Z]+)(\d+)/, "$1 $2");
  }); */

  if ((datas.arrows && datas.arrows.length !== 0) || test === 1) {
    events.sort((a, b) => a.TS - b.TS);
  }

  const makePresent = function () {
    let timeDiff = Date.now() - events[0].TS;
    events.forEach((data) => {
      data.TS += timeDiff + 1000;
    });
  };
  if ((datas.arrows && datas.arrows.length !== 0) || test === 1) {
    makePresent();
  }

  if ((datas.arrows && datas.arrows.length !== 0) || test === 1) {
    setInterval(() => {
      console.log(Math.abs(events[eventNo].TS - Date.now()));
      const apiAttack = function () {
        // console.log(Math.abs(events[eventNo].TS - Date.now()));
        if (Math.abs(events[eventNo].TS - Date.now()) < 300) {
          attack(
            randomCity(events[eventNo].begin),
            events[eventNo].end,
            realDist(),
            0.7,
            events[eventNo].target
          );
          eventNo++;
        }
        if (Math.abs(events[eventNo].TS - Date.now()) > gapInRealAttacks) {
          gapInRealAttacks = 1;
        }
        if (Math.abs(events[eventNo].TS - Date.now()) < 1000) {
          gapInRealAttacks = 0;
        }
      };
      apiAttack();
      apiAttack();
      apiAttack();
      apiAttack();
    }, 400);
  }

  /*  if (events) {
    // just for seeing log if imported data or testdata
    events.forEach((data) => {
      console.log(data);
    });
  } else {
    console.log("No arrows found or data fetch failed.");
  } */

  const refreshData = function (interval = 1800000) {
    //gets the data from the server again

    setInterval(async () => {
      eventNo = 0;
      datas = (await api.getData(team)) || {};
      events = datas.arrows;

      if (test === 1) {
        // testData is in data.js
        events = testData;
      }
      if ((datas.arrows && datas.arrows.length !== 0) || test === 1) {
        events.sort((a, b) => a.TS - b.TS);
        await makePresent();
      }
    }, interval);
  };

  refreshData(refreshInterval);

  const recheckDataSource = function () {
    setInterval(async () => {
      if (!datas.arrows || datas.arrows.length === 0) {
        eventNo = 0;
        datas = (await api.getData(team)) || {};
        events = datas.arrows;

        if (datas.arrows && datas.arrows.length !== 0) {
          events.sort((a, b) => a.TS - b.TS);
          await makePresent();
        }
      }
    }, 30000);
  };
  if (test !== 1) {
    recheckDataSource();
  }
}

async function initialize() {
  try {
    /////////////ALL GRAPHICAL STUFF//////////////
    await loadSVG("map", "mapContainer");
    await map(); //defines map svg object as const
    await animation(); //defines animationSVG as const
    landHover(); // cursor hover effect over land

    mapClick(); //eventListener for clicking on map
    attacksAPI();

    //RANDOM FILLING ATTACKS - active only in gaps of specific lengths//
    setInterval(() => {
      if (gapInRealAttacks === 1 && stopMarker === 0) {
        if (fill === 1) {
          randomSignal("crimsonia", "berylia", 1, 0.7);
          randomSignal("crimsonia", "berylia", 1, 0.7);
          randomSignal("crimsonia", "berylia", 2, 0.7, 40000);
          randomSignal("crimsonia", "berylia", 2, 0.7, 40000);
          randomSignal("crimsonia", "berylia", 3, 0.7, 40000);
          randomSignal("crimsonia", "netoria", randomInt(3), 0.7);
          //Predrawn paths
          randomSignal("westPoint1_w", 0, randomInt(3), 1, 800000, 3); //path name, 0 - predrawn path, threat type, bend of the path(when not predrawn),pause between signals (randomly within this number), animation speed modifier
          randomSignal("westPoint2_w", 0, randomInt(3), 1, 800000, 3);
          randomSignal("westPoint3", 0, randomInt(3), 1, 800000, 2);
          randomSignal("westPoint4", 0, randomInt(3), 1, 800000, 2);
          stopMarker = 1;
        }
      }
    }, 300);

    //activeSignals.forEach(randomSignal);
    //////////////////////////////////////////////// */
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}

//load main code above
document.addEventListener("DOMContentLoaded", initialize);
