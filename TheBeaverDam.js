/*

The Beaver Dam - A management console to help beavers keep track of their logs

Copyright, patented, registered trademark of Seb

Logs provided by the beaver mafia

*/

//Main requirements
const http = require("http");
const fs = require("fs");
const WebSocketServer = require('websocket').server;
const url = require("url");

//Console Interface
const readline = require("readline");
const consoleInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//External files
const { Log, Color, Level } = require("./logger");
const { Stack } = require("./stack");
var LogPile = new Stack();

//HTTP Server
var HostServer = http.createServer(function(req, res) {
    var q = url.parse(req.url, true);
    Log(Level.INFO, "Request received: " + q.pathname);
    if (q.pathname == '/') {
        fs.readFile('./client/index.html', function(err, data) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            return res.end();
        });

    } else if (q.pathname == '/client.js') {
        fs.readFile('./client/client.js', function(err, data) {
            res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
            res.write(data);
            return res.end();
        });

    } else if (q.pathname == '/style.css') {
        fs.readFile('./client/style.css', function(err, data) {
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.write(data);
            return res.end();
        });

    } else if (q.pathname == '/background.png') {
        fs.readFile('./client/background.png', function(err, data) {
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.write(data);
            return res.end();
        });

    } else {
        Log(Level.ERROR, "Resource not found for " + q.pathname);
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end("<html><center><h1>Invalid Request '" + req.url + "'</h1><hr /></center></html>");
    }
});

//Server Startup
Log(Level.SUCCESS, "HTTP Server Started");
HostServer.listen(8000);

Log(Level.SUCCESS, "Gateway Started");
gateway = new WebSocketServer({
    httpServer: HostServer
});

//Gateway functions
function returnStackSize(packet) {
    const reply = {
        "command": "stack_size",
        "size": LogPile.length()
    }
    packet.connection.send(JSON.stringify(reply));
}

function addLogToStack(packet) {
    Log(Level.SUCCESS, "Log added to stack!");
    const log = {
        "wood_type": packet.wood_type,
        "length": packet.log_length,
        "diameter": packet.log_diameter
    }
    LogPile.push(log);
    returnStackSize(packet);
}

function removeLogFromStack(packet) {
    const log = LogPile.pop();
    const reply = {
        "command": "get_log",
        "log": log
    }
    if (log == null) {
        Log(Level.WARN, "The log pile is empty!");
    } else {
        Log(Level.SUCCESS, Color.RED + "Log removed from stack");
    }
    packet.connection.send(JSON.stringify(reply));
    returnStackSize(packet);
}


//The gateway handler
gateway.on('request', function(request) {
    Log(Color.GREEN, "New Beaver Connected To Gateway");
    const connection = request.accept(null, request.origin);

    connection.on('message', function(message) {
        packet = JSON.parse(message.utf8Data);
        packet.connection = connection;

        switch (packet.command) {
            case "push_log":
                addLogToStack(packet);
                break;
            case "pop_log":
                removeLogFromStack(packet);
                break;
            case "get_size":
                returnStackSize(packet);
                break;
        }
    });

    connection.on('close', function(reasonCode, description) {
        Log(Color.RED, "Beaver Disconnected From Gateway");
    });
});

//Console Commands are handled here
function handleConsoleCommand(input) {
    let args = input.split(/ |\n+/g);
    let command = args.shift().toLowerCase();

    if (command == "help") {
        console.log("Command list:\n\nHelp: shows this message\nClear: Clears the log pile\nSize: Gets the size of the log pile");
    } else if (command == "clear") {
        LogPile = new Stack();
        Log(Level.INFO, "The stack has been reset");
        const reply = {
            "command": "stack_size",
            "size": LogPile.length()
        }
        gateway.broadcast(JSON.stringify(reply));
    } else if (command == "size") {
        Log(Level.INFO, "There are " + (LogPile.length()) + " logs on the pile");
    }
}

function promptForCommand() {
    consoleInterface.question(Color.YELLOW, function(inputString) {
        handleConsoleCommand(inputString);
        promptForCommand();
    });
};

promptForCommand();