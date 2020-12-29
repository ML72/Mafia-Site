// shuffles an array randomly
function shuffle(array) {

    array.sort(() => Math.random() - 0.5);
}

// returns an object with assigned roles, given an object as a rolelist and an array of player names
function assignRoles(rolelist, players) {

    let roles = [];
    for(const role in rolelist) {
        for(let i = 0; i < rolelist[role]; i++) {
            roles.push(role);
        }
    }

    let assignment = {};
    shuffle(players);
    for(let i = 0; i < players.length; i++) {
        if(roles[i]) {
            assignment[players[i]] = roles[i];
        } else {
            assignment[players[i]] = "town";
        }
    }

    return assignment;
}

module.exports = { assignRoles };