"use strict";
import {
  loadSVG,
  randomInt,
  getRandomRGB,
  addCSSID,
  cssRuleSelector,
} from "./support.js";
///CONFIG///
const signalDuration = 2500;
let timeBetween = 0;
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
  return `${type}_${String(pathIdCount).padStart(3, "0")}`;
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
////////////////// PATH by ID //////////////////
//makes paths from object to object - uses makePath//
const makePathByID = function (id1, id2, color, bend) {
  const bbox1 = document.getElementById(id1).getBBox();
  const centerX1 = bbox1.x + bbox1.width / 2;
  const centerY1 = bbox1.y + bbox1.height / 2;
  const bbox2 = document.getElementById(id2).getBBox();
  const centerX2 = bbox2.x + bbox2.width / 2;
  const centerY2 = bbox2.y + bbox2.height / 2;
  makePath(centerX1, centerY1, centerX2, centerY2, color, bend);
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
      makePath(clickX, clickY, svgX, svgY, randomInt(2), 1);
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
      duration: 800, // Duration for each animation cycle
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
    timeBetween = 0; //remove delay that is between repeating signals
    stoppedSignals.forEach((param) => {
      randomSignal(param[0], param[1], param[2], param[3]);
    });
    stoppedSignals = [];
  }
});

////// RANDOM SIGNAL ////////
//makes signal appear at intervals
const randomTime = function () {
  return Math.floor(Math.random() * 4000);
};

const randomSignal = function (id1, id2, color, bend) {
  let lastTime = Date.now();
  let randomInterval = randomTime();
  makePathByID(id1, id2, color, bend);
  let pathName = latestPath;
  console.log(pathName);
  let interval1 = setInterval(() => {
    /*  console.log(`timebetween on  ${timeBetween}`);
    console.log(randomInterval + timeBetween);
    console.log(`timeleft ${Date.now() - lastTime}`); */
    if (!isTabActive) {
      clearInterval(interval1);
      console.log("stop"); // clears interval after tab hidden
      stoppedSignals.push([id1, id2, color, bend]); // adds signals to stoppedSignals array for later restart
      removePath(pathName);
      console.log(stoppedSignals);
      return;
    }
    if (Date.now() > lastTime + randomInterval + timeBetween) {
      lastTime = Date.now();
      timeBetween = signalDuration;
      randomInterval = randomTime();

      signal(`${pathName}`);
    }
  }, 100);
};

//All animation paths visible from beginning
/* cssRuleSelector(".up", "visibility", "visible");
cssRuleSelector(".right", "visibility", "visible");
cssRuleSelector(".left", "visibility", "visible");
cssRuleSelector(".down", "visibility", "visible"); */

// function to load main code
async function initialize() {
  try {
    /////////////ALL GRAPHICAL STUFF//////////////
    await loadSVG("map", "mapContainer");
    await map(); //defines map svg object as const
    await animation();
    await mapClick(); //eventListener for clicking on map
    await randomSignal(
      "Daka",
      "Vundan",
      randomInt(2),
      (Math.random() - 0.5) * 4
    );
    await randomSignal(
      "Daka",
      "Vundan",
      randomInt(2),
      (Math.random() - 0.5) * 4
    );
    await randomSignal(
      "Daka",
      "Vundan",
      randomInt(2),
      (Math.random() - 0.5) * 4
    );

    //activeSignals.forEach(randomSignal);
    ////////////////////////////////////////////////
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}
//load main code above
document.addEventListener("DOMContentLoaded", initialize);
