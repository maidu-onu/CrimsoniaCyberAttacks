"use strict";

export const cssRuleSelector = function (selector, property, newValue) {
  for (const sheet of document.styleSheets) {
    for (const rule of sheet.cssRules) {
      if (rule.selectorText === selector) {
        rule.style[property] = newValue;
      }
    }
  }
};
export const loadSVG = async function (fileName, destination = "body") {
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
};
export function randomInt(num) {
  return Math.floor(Math.random() * num) + 1;
}
export function getRandomRGB() {
  const r = Math.floor(Math.random() * 256); // Random number between 0-255
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`; // Return as an RGB string
}

//ads new css rule
export function addCSS(Name, rules) {
  const styleSheet = document.styleSheets[0]; // Get the first stylesheet
  styleSheet.insertRule(`${Name} { ${rules} }`, styleSheet.cssRules.length);
}

// Amplitude of random bendiness
export function bendRandom(bendiness) {
  return (Math.random() - 0.5).toFixed(1) * 2 * bendiness;
}
