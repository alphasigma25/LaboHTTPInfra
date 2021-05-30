var Chance = require("chance");
var chance = new Chance();

var express = require("express");
var app = express();

app.get('/spells', function (req, res) {
    res.send(generateSpells());
});

app.get('/test', function (req, res) {
    res.send("test :)");
});

app.get('/', function (req, res) {
    res.send("Hello " + chance.name());
});

app.listen(3000, function () {
    console.log("Acception HTTP request on port 3000.");
});

function generateSpells() {
    const numberOfSpells = chance.integer({
        min: 1,
        max: 10
    }).valueOf();
    console.log(numberOfSpells);
    let spells = []
    for (let i = 0; i < numberOfSpells; ++i) {
        var mana = chance.integer({
            min: 1,
            max: 100
        })
        var formula = chance.word()
        var effect = chance.sentence()
        spells.push({
            mana: mana,
            formula: formula,
            effect: effect,
        })
    }
    console.log(spells)
    return spells
}