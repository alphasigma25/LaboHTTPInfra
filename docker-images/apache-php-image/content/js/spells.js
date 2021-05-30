$(function () {
    console.log("loading students");

    function loadStudents() {
        $.getJSON( "/api/spells/spells/", function( spells ){
            console.log(spells);
            var message = "No spell in the book";
            if (spells.length > 0){
                message = spells[0].formula + " " + spells[0].mana;
            }
            $(".masthead-heading").text(message);
        }) ;
    }

    loadStudents();
    setInterval( loadStudents, 2000);
});