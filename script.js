const signalDuration = 2500;
let activeSignals = ["path_001", "path1", "path2", "path3", "path4", "path5"];
let stoppedSignals = [];

async function loadSVG(fileName, destination = "body") {
  try {
    // Fetch the SVG file
    const response = await fetch(`SVG/${fileName}.svg`);

    // Convert the response to text (SVG content)
    const svgContent = await response.text();

    // Create a temporary container for the SVG content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = svgContent;

    // Get the first SVG element from the loaded content
    const svgElement = tempDiv.querySelector("svg");

    if (fileName === "map" && svgElement) {
      // Set preserveAspectRatio attribute if fileName is 'main'
      svgElement.setAttribute("preserveAspectRatio", "xMidYMin meet");
      svgElement.setAttribute("id", "map");
    }

    // Insert the modified SVG content into the specified destination
    document
      .getElementById(destination)
      .insertAdjacentHTML("beforeend", tempDiv.innerHTML);
  } catch (error) {
    console.error("Error loading SVG:", error);
  }
}

let pathIdCount = 1;
const makePath = function (x1, y1, x2, y2, bend = 0, animate = 1) {
  const xhalf = (x2 - x1) / 2;
  const yhalf = (y2 - y1) / 2;
  const xbend = xhalf - bend * yhalf;
  const ybend = yhalf + bend * xhalf;

  let direction;
  if (Math.abs(xhalf) >= Math.abs(yhalf)) {
    xhalf > 0 ? (direction = "right") : (direction = "left");
  } else {
    yhalf > 0 ? (direction = "down") : (direction = "up");
  }

  document.querySelector(".svg").insertAdjacentHTML(
    "afterbegin",
    ` <path
          id="path_${String(pathIdCount).padStart(3, "0")}"
          class=${direction} 
          d="m${x1},${y1}s${xbend},${ybend},${x2 - x1},${y2 - y1}"
        />
`
  );
  animate = 1
    ? activeSignals.push(`path_${String(pathIdCount).padStart(3, "0")}`)
    : "";
  pathIdCount++;
};

const makePathByID = function (id1, id2, bend) {
  const bbox1 = document.getElementById(id1).getBBox();
  const centerX1 = bbox1.x + bbox1.width / 2;
  const centerY1 = bbox1.y + bbox1.height / 2;
  const bbox2 = document.getElementById(id2).getBBox();
  const centerX2 = bbox2.x + bbox2.width / 2;
  const centerY2 = bbox2.y + bbox2.height / 2;
  makePath(centerX1, centerY1, centerX2, centerY2, bend);
};

// Clickable line generation
let clickx;
let clicky;
let clickNum = 0;
document.addEventListener("click", function (event) {
  const x = event.clientX / (document.documentElement.clientWidth / 1920);
  const y = event.clientY / (document.documentElement.clientWidth / 1920);
  clickNum++;
  if (clickNum === 2) {
    makePath(clickx, clicky, x, y, 1);
    clickNum = 0;
  }
  clickx = x;
  clicky = y;
  console.log("Mouse clicked at:", x, y);
  console.log(window.innerWidth + " " + window.innerHeight);
  console.log(
    document.documentElement.clientWidth +
      " " +
      document.documentElement.clientHeight
  );

  randomSignal(`path_${String(pathIdCount - 1).padStart(3, "0")}`);
});

// Function that creates line and circular explosion signal after
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

  let circleName = "#in1";
  switch (pathName) {
    case "path1":
      circleName = "#in1";
      break;
    case "path2":
      circleName = "#in2";
      break;
    case "path3":
      circleName = "#in3";
      break;
    case "path4":
      circleName = "#in4";
      break;
    case "path5":
      circleName = "#in5";
      break;
    case "path6":
      circleName = "#in6";
      break;
  }

  timeline.add(
    {
      targets: circleName,
      scale: [0, 20, 0], // Animate from 1 to 20 and back to 1
      duration: 800, // Duration for each animation cycle
      //direction: "alternate", // Alternate between scaling up and down
      easing: "easeOutSine",
    },
    `-=${signalDuration * 0.6}`
  );
};

//It starts signals once again after the tab has changed back
let isTabActive = true;
document.addEventListener("visibilitychange", () => {
  isTabActive = !document.hidden;
  if (isTabActive) {
    stoppedSignals.forEach(randomSignal);
    stoppedSignals = [];
  }
});

let counter = 0;

const randomSignal = function (pathName) {
  let timeBetween = 0;
  let lastTime = Date.now();
  counter++;

  document.addEventListener("visibilitychange", () => {
    isTabActive = !document.hidden;
    if (!isTabActive) {
    }
  });

  let interval1 = setInterval(() => {
    if (!isTabActive) {
      timeBetween = 0;
      clearInterval(interval1);
      stoppedSignals.push(pathName);
    }
    if (
      Date.now() >
      lastTime + Math.floor(Math.random() * 40000) + timeBetween // siin on mingi jama et iga 0.2 seki tagant teeb random numbri kuniks sobib
    ) {
      console.log(Math.floor(Math.random() * 40000));
      signal(`${pathName}`);
      //randomSignal(pathName);
      lastTime = Date.now();
      timeBetween = 2500;
    }
  }, 200);
};
const cssRuleSelector = function (selector, property, newValue) {
  for (const sheet of document.styleSheets) {
    for (const rule of sheet.cssRules) {
      if (rule.selectorText === selector) {
        rule.style[property] = newValue;
      }
    }
  }
};

/* cssRuleSelector(".up", "visibility", "visible");
cssRuleSelector(".right", "visibility", "visible");
cssRuleSelector(".left", "visibility", "visible");
cssRuleSelector(".down", "visibility", "visible"); */

async function initialize() {
  try {
    await loadSVG("map", "mapContainer");
    await makePathByID("Daka", "Vundan", 0.3);
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}

document.addEventListener("DOMContentLoaded", initialize);

activeSignals.forEach(randomSignal);

/* 
- Illukas joonistan hulga pathi paare
- scriptis korrastan 
- childappendiga lisan ja kustutan igakord kui signaal on
; */
