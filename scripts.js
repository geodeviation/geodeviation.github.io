"use strict";

if (!navigator.geolocation) {
  console.log("Geolocation is not supported for this Browser/OS.");
}

let currentPosition,
  nextPosition,
  positionObject = "";

const latitudeEl = document.querySelector(".js_current_lat"),
  longitudeEl = document.querySelector(".js_current_lon"),
  timeEl = document.querySelector(".js_current_time");

const watchId = navigator.geolocation.watchPosition(
  position => {
    geoSuccess(position);
  },
  error => {
    geoError(error);
  }
);

const printTime = timestamp => {
  const options = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric"
  };

  return new Date(timestamp).toLocaleString("nb-NO", options);
};

const copyReportBtn = document.querySelector(".js_copy_report_btn");

copyReportBtn.addEventListener("click", function(event) {
  copyTextToClipboard(positionObject);
});

const geoSuccess = nextPosition => {
  if (!currentPosition) {
    currentPosition = nextPosition;
  }

  const currentLatitude = currentPosition.coords.latitude,
    currentLongitude = currentPosition.coords.longitude,
    nextLatitude = nextPosition.coords.latitude,
    nextLongitude = nextPosition.coords.longitude,
    nextTime = printTime(nextPosition.timestamp);

  const currentLatitudeInInt = parseInt(currentLatitude),
    currentLongitudeInInt = parseInt(currentLongitude),
    nextLatitudeInInt = parseInt(nextLatitude),
    nextLongitudeInInt = parseInt(nextLongitude),
    nextLatitudeAsFloat = parseFloat(nextLatitude).toFixed(2),
    nextLongitudeAsFloat = parseFloat(nextLongitude).toFixed(2);

  if (
    !nextLatitudeInInt ||
    isNaN(nextLatitudeInInt) ||
    (!nextLongitudeInInt || isNaN(nextLongitudeInInt))
  ) {
    return;
  }

  if (
    currentLatitudeInInt &&
    !isNaN(currentLatitudeInInt) &&
    (currentLongitudeInInt && !isNaN(currentLongitudeInInt))
  ) {
    if (
      !(
        Number(currentLatitudeInInt) === Number(nextLatitudeInInt) &&
        Number(currentLongitudeInInt) === Number(nextLongitudeInInt)
      )
    ) {
      registerDeviation(nextPosition, currentPosition);
    }
  }

  latitudeEl.innerHTML = nextLatitudeAsFloat;
  longitudeEl.innerHTML = nextLongitudeAsFloat;
  timeEl.innerHTML = nextTime;

  currentPosition = nextPosition;
};

const registerDeviation = (nextPosObject, prevPosObject) => {
  const prevTime = printTime(prevPosObject.timestamp);
  const nextTime = printTime(nextPosObject.timestamp);

  if (document.querySelector(".js-no-record")) {
    removeNoneNotification();
  }

  positionObject += "Position:\n";
  positionObject += printObject(nextPosObject);

  const deviation_template = document.querySelector(".js_deviation_template"),
    append_deviation_to = document.querySelector(".js_deviation_table");
  let clone;

  deviation_template.content.querySelector(".js_time").innerHTML = nextTime;
  deviation_template.content.querySelector(
    ".js_longitude"
  ).innerHTML = parseFloat(nextPosObject.coords.longitude).toFixed(2);
  deviation_template.content.querySelector(
    ".js_latitude"
  ).innerHTML = parseFloat(nextPosObject.coords.latitude).toFixed(2);

  clone = document.importNode(deviation_template.content, true);
  append_deviation_to.appendChild(clone);
};

function fallbackCopyTextToClipboard(text) {
const removeNoneNotification = (tableSelector, noneNotificationSelector) => {
  const deviation_table = document.querySelector(tableSelector + " tbody"),
    notification = document.querySelector(noneNotificationSelector);
  deviation_table.removeChild(notification);
  const copyReportBtn = document.querySelector(".js_copy_report_btn");
  copyReportBtn.disabled = false;
};

  var textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand("copy");
    var msg = successful ? "successful" : "unsuccessful";
    console.log("Fallback: Copying text command was " + msg);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text);
}

const printObject = (obj, level = 1) => {
  let printedObject = "";
  for (const property in obj) {
    if (typeof obj[property] === "object") {
      printedObject += "\t".repeat(level) + property + ": \n";
      printedObject += printObject(obj[property], level + 1);
    } else {
      printedObject +=
        "\t".repeat(level) + property + ": " + obj[property] + ";\n";
    }
  }
  return printedObject;
};

const geoError = error => {
  const errorCodes = [
      "unknown error",
      "permission denied (you didn't enable positioning)",
      "position unavailable",
      "timed out"
    ],
    nil = "-";
  latitudeEl.innerHTML =
    "Error occurred. Error code: " + error.code + ": " + errorCodes[error.code];
  longitudeEl.innerHTML = nil;
  timeEl.innerHTML = nil;
};
