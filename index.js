// IMPORTS AND SETUP
const express = require('express');
const cache = require('memory-cache');

const PORT = process.env.PORT || 3000;
const app = express();

var rooms = new cache.Cache();



// LISTEN TO GET ROUTES
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
    cache.put(code, {
        roles: {},
        players: {}
    }, 6*60*60*1000, function(key, value) {
        console.log('Room with code ' + code + ' has closed');
    });

    console.log('Room with code ' + code + ' has opened');

    // render page
    res.render(__dirname + '/views/host.ejs', { pageName: "Host Game", code });
});

app.get("/join", (req, res) => {

    res.render(__dirname + '/views/join.ejs');
});

app.get("*", (req, res) => {
    res.redirect('/');
});



// START SERVER
app.listen(PORT, (req, res) => {
    console.log(`Server Started at PORT ${PORT}`);
});
  