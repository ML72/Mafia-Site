// IMPORTS AND SETUP
const express = require('express');
const cache = require('memory-cache');
const { assignRoles } = require('./helpers/roles');

const PORT = process.env.PORT || 3000;
const app = express();

var rooms = new cache.Cache();



// LISTEN TO API ROUTES
app.get("/api/hostUpdate", async (req, res) => {

    let { roles, code } = req.query;
    roles = JSON.parse(roles);
    let room = await rooms.get(code);

    if(room) {
        
        Object.keys(roles).forEach((role) => {
            if(!roles[role] || parseInt(roles[role]) < 0) {
                roles[role] = "" + 0;
            }
        });

        room = {
            players: room.players,
            roles: roles,
            assignment: room.assignment
        }

        rooms.put(code, room, 6*60*60*1000, function(key, value) {
            console.log('Room with code ' + code + ' has closed');
        });

        res.json(room);
    } else {
        res.json({
            players: []
        });
    }
});

app.get("/api/guestUpdate", async (req, res) => {

    let { code, name } = req.query;
    let room = await rooms.get(code);

    if(room) {
        
        let assignment = (room.assignment && room.assignment[name]) ? room.assignment[name] : "";

        res.json({
            players: room.players,
            roles: room.roles,
            assignment
        });
    } else {
        res.json({
            players: [],
            roles: {},
            assignment: ""
        });
    }
});

app.get("/api/createRoles", async (req, res) => {

    let { roles, code } = req.query;
    roles = JSON.parse(roles);
    let room = await rooms.get(code);

    if(room) {
        
        Object.keys(roles).forEach((role) => {
            if(parseInt(roles[role]) < 0) {
                roles[role] = "" + 0;
            }
        });

        let assignment = await assignRoles(roles, room.players);

        room = {
            players: room.players,
            roles,
            assignment
        }

        rooms.put(code, room, 6*60*60*1000, function(key, value) {
            console.log('Room with code ' + code + ' has closed');
        });

        res.json({
            success: true,
            assignment
        })
    } else {
        res.json({
            success: false
        });
    }
});



// LISTEN TO VIEW ROUTES
app.get("/", (req, res) => {
    res.render(__dirname + '/views/landing.ejs');
});

app.get("/new", (req, res) => {

    // generate a game code
    var code = '' + Math.floor(10000 + Math.random() * 90000);
    while(rooms.get(code)) {
        code = '' + Math.floor(10000 + Math.random() * 90000);
    }

    // store code as new game in memory cache
    rooms.put(code, {
        roles: {},
        players: [],
        assignment: {}
    }, 6*60*60*1000, function(key, value) {
        console.log('Room with code ' + code + ' has closed');
    });

    console.log('Room with code ' + code + ' has opened');

    // render page
    res.render(__dirname + '/views/host.ejs', { pageName: "Host Game", code });
});

app.get("/join", (req, res) => {

    res.render(__dirname + '/views/join.ejs', { pageName: "Join Game", code: null, name: "" });
});

app.get("/game/:code", (req, res) => {

    let { code } = req.params;
    let { name } = req.query;

    let room = rooms.get('' + code);
    if(!name) {
        name = "Player" + Math.floor(Math.random() * 1000);
    }

    if(!room) {
        res.render(__dirname + '/views/join.ejs', { pageName: "Join Game", code, name });
    } else {

        rooms.put(code, {
            roles: room.roles,
            players: [ name, ...room.players ],
            assignment: room.assignment
        }, 6*60*60*1000, function(key, value) {
            console.log('Room with code ' + code + ' has closed');
        });
    
        res.render(__dirname + '/views/guest.ejs', { pageName: "Game " + code + " - " + name, code, name });
    }
});

app.get("*", (req, res) => {
    res.redirect('/');
});



// START SERVER
app.listen(PORT, (req, res) => {
    console.log(`Server Started at PORT ${PORT}`);
});
  