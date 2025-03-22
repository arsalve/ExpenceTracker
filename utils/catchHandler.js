const colors = require('colors');

const ErrorC = colors.red.bold;
const suc = colors.green;
const Warning = colors.yellow;
const good = colors.cyan;

function catchHandler(location, message, type, debug = true) {
    if (debug) {
        let color;
        switch (type) {
            case "Error":
                color = ErrorC;
                break;
            case "sucess":
                color = suc;
                break;
            case "Warning":
                color = Warning;
                break;
            case "good":
                color = good;
                break;
            default:
                color = good;
                break;
        }
        console.error(color(`Log at ${location}\n information : ${message}`));
    }
}

module.exports = catchHandler;
