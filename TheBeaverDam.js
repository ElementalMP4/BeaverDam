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

var LogPile;

switch (config.default_mode) {
    case "q":
        LogPile = new structures.Queue();
        Log(Level.INFO, "The Log Pile has been initialised as a Queue");
        startServer();
        break;
    case "s":
        LogPile = new structures.Stack();
        Log(Level.INFO, "The Log Pile has been initialised as a Stack");
        startServer();
        break;
    default:
        Log(Level.ERROR, "The default mode has not been specified correctly. Exiting.");
        process.exit(1);
}

//External files
const { Log, Color, Level } = require("./logger");
const structures = require("./structures");
const config = require("./config.json");

//HTTP Server
var HostServer = http.createServer(function(req, res) {
    var q = url.parse(req.url, true);
    Log(Level.INFO, "Request received: " + q.pathname);
    if (q.pathname == '/') {
        fs.readFile('./www/index.html', function(err, data) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            return res.end();
        });

    } else if (q.pathname == '/client.js') {
        fs.readFile('./www/client.js', function(err, data) {
            res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
            res.write(data);
            return res.end();
        });

    } else if (q.pathname == '/style.css') {
        fs.readFile('./www/style.css', function(err, data) {
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.write(data);
            return res.end();
        });

    } else if (q.pathname == '/background.png') {
        fs.readFile('./www/img/background.png', function(err, data) {
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.write(data);
            return res.end();
        });

    } else if (q.pathname.startsWith("/logs/")) {
        if (fs.existsSync("./www/img" + q.pathname)) {
            fs.readFile("./www/img" + q.pathname, function(err, data) {
                res.writeHead(200, { 'Content-Type': 'image/png' });
                res.write(data);
                return res.end();
            });
        }

    } else {
        Log(Level.ERROR, "Resource not found for " + q.pathname);
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end("<html><center><h1>Invalid Request '" + req.url + "'</h1><hr /></center></html>");
    }
});

//Gateway functions
function returnStackSize() {
    const reply = {
        "command": "stack_size",
        "size": LogPile.length()
    }
    gateway.broadcast(JSON.stringify(reply));
}

function addLogToStack(packet) {
    Log(Level.SUCCESS, "Log added to stack!");
    const log = {
        "wood_type": packet.wood_type,
        "length": packet.log_length,
        "diameter": packet.log_diameter
    }
    LogPile.push(log);
    returnStackSize();
}

function removeLogFromStack(packet) {
    const log = LogPile.pop();
    const reply = {
        "command": "get_log",
        "log": log
    }
    if (LogPile.isEmpty()) {
        Log(Level.WARN, "The log pile is empty!");
    } else {
        Log(Level.SUCCESS, Color.RED + "Log removed from stack");
    }
    packet.connection.send(JSON.stringify(reply));
    returnStackSize();
}

//Console Commands are handled here
function handleConsoleCommand(input) {
    let args = input.split(/ |\n+/g);
    let command = args.shift().toLowerCase();

    if (command == "help") {
        console.log(`Command list:\n\n
        Help: shows this message\n
        Size: Gets the size of the log pile\n
        InitStack: Reinitialise the Log Pile as a Stack\n
        InitQueue: Reinitialise the Log Pile as a Queue
        `);
    } else if (command == "initstack") {
        LogPile = new structures.Stack();
        Log(Level.INFO, "The Log Pile has been initialised as a Stack");
        returnStackSize();
    } else if (command == "initqueue") {
        LogPile = new structures.Queue();
        Log(Level.INFO, "The Log Pile has been initialised as a Queue");
        returnStackSize();
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

function startServer() {

    if (config.gateway_port == undefined) {
        Log(Level.ERROR, "The Gateway Port has not been specified. Exiting.");
    } else {
        Log(Level.SUCCESS, "HTTP Server Started");
        HostServer.listen(config.gateway_port);

        Log(Level.SUCCESS, "Gateway Started");
        gateway = new WebSocketServer({
            httpServer: HostServer
        });

        //The gateway handler
        gateway.on('request', function(request) {
            Log(Color.GREEN, "New Beaver Connected To Gateway: " + request.key + " @ " + request.remoteAddress);
            const connection = request.accept(null, request.origin);

            connection.on('message', function(message) {
                packet = JSON.parse(message.utf8Data);
                packet.connection = connection;
                Log(Level.INFO, "Gateway Command Received: " + packet.command)
                switch (packet.command) {
                    case "push_log":
                        addLogToStack(packet);
                        break;
                    case "pop_log":
                        removeLogFromStack(packet);
                        break;
                    case "get_size":
                        returnStackSize();
                        break;
                }
            });

            connection.on('close', function(reasonCode, description) {
                Log(Color.RED, "Beaver Disconnected From Gateway: " + request.key + " @ " + request.remoteAddress);
            });
        });
    }
}