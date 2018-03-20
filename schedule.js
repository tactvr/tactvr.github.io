function generateSchedule(containerLocator, scheduleArray) {
    var jqContainer = $(containerLocator).empty();
    $.each(scheduleArray, function(key, value){ 
        $(containerLocator).append(makeRow(value));
    });
}
function makeRow(rowData){
    var row = $("<div>", { class: "pure-g eventRow"});
    row.append( $("<div>", {
        class: "pure-u-1-3",
        text: rowData.date,
    }));
    row.append( $("<div>", {
        class: "pure-u-1-3",
        text: rowData.name,
    }));
    row.append( $("<div>", {
        class: "pure-u-1-3",
        text: "Register",
    }));        
    return row;
}