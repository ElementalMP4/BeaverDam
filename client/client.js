const websocketServerURL = "ws://" + location.host;
var webSocket = new WebSocket(websocketServerURL);

var connected = false;

function getTimeStamp() {
    const date = new Date();
    const time = date.toLocaleTimeString();
    const calendar = date.toLocaleDateString();

    return calendar + " @ " + time
}

function addLogToStack(log) {
    const logToBeSent = {
        "command": "push_log",
        "wood_type": log.wood_type,
        "log_length": log.log_length,
        "log_diameter": log.log_diameter
    }
    webSocket.send(JSON.stringify(logToBeSent));
}

function removeLogFromStack() {
    const payload = {
        "command": "pop_log"
    }
    webSocket.send(JSON.stringify(payload));
}

function setStackSize(packet) {
    document.getElementById("log-counter").innerHTML = "Logs on the pile: " + packet.size;
}

function displayNewLog(packet) {
    let response;
    if (packet.log == null) {
        response = "There are no more logs!"
    } else {
        response = "Wood type: " + packet.log.wood_type + "<br>Length: " + packet.log.length + "<br>Diameter: " + packet.log.diameter;
    }
    document.getElementById("log-from-stack").innerHTML = response;
    document.getElementById("retrieval-timestamp").innerHTML = "Retrieved at " + getTimeStamp();
}

function getStackSize() {
    const payload = {
        "command": "get_size"
    }
    webSocket.send(JSON.stringify(payload));
}

function submitLog() {
    const log = {
        "wood_type": document.getElementById("log-type").value,
        "log_length": document.getElementById("log-length").value,
        "log_diameter": document.getElementById("log-diameter").value
    }
    addLogToStack(log);

    document.getElementById("submission-timestamp").innerHTML = "Submitted at " + getTimeStamp();
}

document.getElementById("status").innerHTML = "Connecting..."
document.getElementById("status").style.color = "yellow"

webSocket.onmessage = function(content) {
    serverPacket = JSON.parse(content.data);
    console.log(JSON.stringify(serverPacket));

    switch (serverPacket.command) {
        case "stack_size":
            setStackSize(serverPacket);
            break;
        case "get_log":
            displayNewLog(serverPacket);
            break;
    }
}

webSocket.onopen = function() {
    document.getElementById("status").innerHTML = "Connected!";
    document.getElementById("status").style.color = "green"
    console.log("Connected to the Beaver Dam Gateway");
    getStackSize();
    connected = true;
}

webSocket.onclose = function() {
    if (connected) {
        document.getElementById("status").innerHTML = "Connection lost"
        document.getElementById("status").style.color = "red"
    }
};

webSocket.onerror = function() {
    document.getElementById("status").innerHTML = "Failed to connect"
    document.getElementById("status").style.color = "red"
};