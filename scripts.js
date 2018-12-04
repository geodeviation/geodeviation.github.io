"use strict";

if (!navigator.geolocation) {
    console.log("Geolocation is not supported for this Browser/OS.");
}

let currentPosition,
    nextPosition,
    positionObject = "",
    errorClassName = "error";

const latitudeEl = document.querySelector(".js_current_lat"),
    longitudeEl = document.querySelector(".js_current_lon"),
    timeEl = document.querySelector(".js_current_time"),
    devLatitudeCN = ".js_latitude",
    devLongitudeCN = ".js_longitude",
    devTimeCN = ".js_time";

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
        currentTime = Date.now(),
        nextTimeStamp = nextPosition.timestamp,
        nextTime = printTime(nextTimeStamp),
        errors = [];


    const currentLatitudeAsFloat = parseFloat(currentLatitude).toFixed(2),
        currentLongitudeAsFloat = parseFloat(currentLongitude).toFixed(2),
        nextLatitudeAsFloat = parseFloat(nextLatitude).toFixed(2),
        nextLongitudeAsFloat = parseFloat(nextLongitude).toFixed(2);

    const latitudeVarians = 0.01,
        longitudeVarians = 0.04,
        timeVarians = 60000;

    if (
        !nextLatitudeAsFloat ||
        isNaN(nextLatitudeAsFloat) ||
        (!nextLongitudeAsFloat || isNaN(nextLongitudeAsFloat))
    ) {
        return;
    }

    if (
        currentLatitudeAsFloat &&
        !isNaN(currentLatitudeAsFloat) &&
        (currentLongitudeAsFloat && !isNaN(currentLongitudeAsFloat))
    ) {
        const latitudeDev = noDeviation(currentLatitudeAsFloat, nextLatitudeAsFloat, latitudeVarians, devLatitudeCN);
        if (typeof latitudeDev !== 'undefined') {
            errors.push(latitudeDev);
        }
        const longitudeDev = noDeviation(currentLongitudeAsFloat, nextLongitudeAsFloat, longitudeVarians, devLongitudeCN);
        if (typeof longitudeDev !== 'undefined') {
            errors.push(longitudeDev);
        }
        const timeDev = noDeviation(currentTime, nextTimeStamp, timeVarians, devTimeCN);
        if (typeof timeDev !== 'undefined') {
            errors.push(timeDev);
        }
        if (errors.length > 0) {
            registerDeviation(nextPosition, currentPosition, errors);
        } else {
            const extraString =
                currentLatitudeAsFloat + "===" + nextLatitudeAsFloat + "\n" +
                currentLongitudeAsFloat + "===" + nextLongitudeAsFloat;
            printDataOnPage(nextPosition, ".js_no_deviation_table", extraString);
        }
    }

    latitudeEl.innerHTML = nextLatitudeAsFloat;
    longitudeEl.innerHTML = nextLongitudeAsFloat;
    timeEl.innerHTML = nextTime;

    currentPosition = nextPosition;
};

const noDeviation = (currentValue, nextValue, varians, el) => {
    const isNotLower = (currentValue - varians) < nextValue;
    const isNotHigher = (currentValue + varians) > nextValue;
    const noDeviation = isNotLower && isNotHigher;
    if (!noDeviation) {
        return el;
    }
};

const registerDeviation = (nextPosObject, prevPosObject, errors) => {
    printDataOnPage(nextPosObject, ".js_deviation_table", errors);

    positionObject += "Position:\n";
    positionObject += printObject(nextPosObject);
};

const printDataOnPage = (nextPosObject, tableSelector, errors) => {
    const nextTime = printTime(nextPosObject.timestamp),
        noneNotificationSelector = tableSelector + " .js-no-record";

    let extraString,
        clone;

    if (!Array.isArray(errors)) {
        extraString = errors;
        errors = [];
    }

    if (document.querySelector(noneNotificationSelector)) {
        removeNoneNotification(tableSelector, noneNotificationSelector);
    }

    const deviation_template = document.querySelector(".js_deviation_template"),
        append_deviation_to = document.querySelector(tableSelector);

    const devTimeEl = deviation_template.content.querySelector(devTimeCN),
        devLongitudeEl = deviation_template.content.querySelector(devLongitudeCN),
        devLatitudeEl = deviation_template.content.querySelector(devLatitudeCN);

    devTimeEl.innerHTML = nextTime;
    if (errors.includes(devTimeCN)) {
        devTimeEl.classList.add(errorClassName);
    }

    devLatitudeEl.innerHTML = parseFloat(nextPosObject.coords.latitude).toFixed(2);
    if (errors.includes(devLatitudeCN)) {
        devLatitudeEl.classList.add(errorClassName);
    }

    if (extraString) {
        devLongitudeEl.innerHTML = parseFloat(nextPosObject.coords.longitude).toFixed(2) + " - " + extraString;
    } else {
        devLongitudeEl.innerHTML = parseFloat(nextPosObject.coords.longitude).toFixed(2);
    }
    if (errors.includes(devLongitudeCN)) {
        devLongitudeEl.classList.add(errorClassName);
    }

    clone = document.importNode(deviation_template.content, true);
    append_deviation_to.appendChild(clone);
};

const removeNoneNotification = (tableSelector, noneNotificationSelector) => {
    const deviation_table = document.querySelector(tableSelector + " tbody"),
        notification = document.querySelector(noneNotificationSelector);
    deviation_table.removeChild(notification);
    const copyReportBtn = document.querySelector(".js_copy_report_btn");
    copyReportBtn.disabled = false;
};


const fallbackCopyTextToClipboard = (text) => {
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
};

const copyTextToClipboard = (text) => {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text);
};

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