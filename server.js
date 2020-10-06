var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
server.listen(3000, "0.0.0.0");
app.use(express.static("./public"));
console.log("Server is listening on port 3000");

var connections = [];
var users = [];
let document = "";

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function documentInsertion(pos, char){
    document = document.substr(0, pos) + char + document.substr(pos, document.length);
    documentUpdated()
}

function documentDeletion(pos){
    document = document.substr(0, pos) + document.substr(pos + 1, document.length);
    documentUpdated()
}

function documentUpdated(){
    console.log(document);
}


io.sockets.on("connection", function (socket) {
    connections.push(socket);
    console.log("New connection");

    socket.on("user", function (data) {
        console.log("User connected");
        users.push(socket);
    });

    socket.on("insertion", data => {
        documentInsertion(data.pos, data.char);
        sendCmdUsers("insertion", data, socket);
    });

    socket.on("deletion", data => {
        documentDeletion(data.pos);
        sendCmdUsers("deletion", data, socket);
    });

    socket.on("disconnect", function (data) {
        if (users.includes(socket)) {
            console.log("user disconnected");
            users.splice(users.indexOf(socket), 1);
        } else {
            console.log("an unregistered device disconnected");
        }

        connections.splice(connections.indexOf(socket), 1);
    });

    
});

function sendCmdUsers(cmd, data, exclude) {
    console.log("Sending cmd : " + cmd + " to users");
    for (let user of users) {
        if (exclude && user === exclude) {
            continue
        }
        if (data) {
            user.emit(cmd, data);
        } else {
            user.emit(cmd);
        }

    }
}