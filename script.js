const signalDuration = 2500;
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
  console.log(circleName);
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

  /*  timeline.add({
    targets: svgPath,
    loop: true,
    direction: "normal",
    strokeDashoffset: [-pathLength, anime.setDashoffset],
    easing: "easeInOutSine",
    duration: 1500,
    delay: 500,
  }); */
};

/* const randomDelay = function (timeBetween) {
  return 5;
}; */
signal("path1");
const randomSignal = function (pathName) {
  const randomDelay = Math.floor(Math.random() * 10000) + 2500;

  setTimeout(() => {
    signal(`${pathName}`);
    randomSignal(pathName);
  }, randomDelay);
};

randomSignal("path1");
randomSignal("path2");
randomSignal("path3");
randomSignal("path4");
randomSignal("path5");
randomSignal("path6");

/* 
- Illukas joonistan hulga pathi paare
- scriptis korrastan 
- childappendiga lisan ja kustutan igakord kui signaal on
; */
