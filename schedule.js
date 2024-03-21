(function() {
var NOW = new Date();
//var NOW = new Date("2018-03-24");
var YEAR = (new Date()).getFullYear();

var MSR_CACHE = {};

var COLUMN_CLASSES = [
    "pure-u-3-24",
    "pure-u-6-24",
    "pure-u-11-24",
    "pure-u-4-24",
];

$(function() {
    $('head').append('<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.8/css/all.css" integrity="sha384-3AB7yXWz4OeoZcPbieVW64vVXEwADiYyAEhwilzWsLw+9FgqpyjjStpPnpBO8o8S" crossorigin="anonymous">');
    $('head').append('<link rel="stylesheet" href="https://unpkg.com/purecss@1.0.0/build/pure-min.css" integrity="sha384-nn4HPE8lTHyVtfCBi5yW9d20FjT8BJwUXyWZT9InLYax14RDjBj46LmSztkmNP9w" crossorigin="anonymous">');
    var urlPrefix = "";
    if (window.location.href.indexOf("file:") != 0) {
        urlPrefix = "https://tactvr.github.io/";
    }
    $('head').append('<link rel="stylesheet" href="' + urlPrefix + 'schedule.css">');
});

$.fn.generateSchedule = function(scheduleArray) {
    var element = this;
    element.empty().addClass("eventTable");
    generateHeaderRow().appendTo(element);

    var eventsWithMsrIds = {};
    $.each(scheduleArray, function(key, value){ 
        value.eventDateJs = new Date(value.eventDate + "T08:00:00-05:00");
        element.append(makeRow(value));
        if (value.eventDateJs > NOW && value.msr_id){
            eventsWithMsrIds[value.msr_id] = value;
        }
    });
    generateColorKey().appendTo(element);

    populateFromMsr(eventsWithMsrIds);
}

function generateColorKey() {
    var element = $("<div>", { class:"centeringBlock"});
    $("<div>", { 
        class: "eventExample championshipEvent", 
        text: "Event is part of the TAC Championship Series"}
    ).appendTo(element);
    return element;
}

function generateHeaderRow() {
    var headerRow = $("<div>", { class:"pure-g headerRow"});
    var col = 0;
    $("<div>", {class: COLUMN_CLASSES[col++], text:"Date"}).appendTo(headerRow);
    $("<div>", {class: COLUMN_CLASSES[col++], text: "Event"}).appendTo(headerRow);
    $("<div>", {class: COLUMN_CLASSES[col++], text: "Registration"}).appendTo(headerRow);
    $("<div>", {class: COLUMN_CLASSES[col++], text: "Results"}).appendTo(headerRow);
    return headerRow;
}

function populateRegistered(jqElement, msrEventGUID) {
    var afterAjax =  function(json){
        jqElement.html("");
        jqElement.append('[' + json.response.recordset.total + '&nbsp;registered]');
    };
    
    if (typeof MSR_CACHE[msrEventGUID] !== 'undefined') {
        afterAjax(MSR_CACHE[msrEventGUID]);
    } else {
        $.ajax('https://api.motorsportreg.com/rest/events/' + msrEventGUID + '/entrylist.json', {
            async: true,
            cache: false,
            dataType: 'json',
        }).done(function(json) {
            MSR_CACHE[msrEventGUID] = json;
            afterAjax(json);
        });
    }
}

function attachResultLinks(jqContainer, axwareName, eventDateJs){
    $("<a>", { href:"//teamtac.org/archive/" + eventDateJs.getFullYear() + "/autox/" + axwareName + "_fin.htm", text: "Final"}).appendTo(jqContainer);
    jqContainer.append(" - ");
    $("<a>", { href:"//teamtac.org/archive/" + eventDateJs.getFullYear() + "/autox/" + axwareName + "_raw.htm", text: "Raw"}).appendTo(jqContainer);
    jqContainer.append(" - ");
    $("<a>", { href:"//teamtac.org/archive/" + eventDateJs.getFullYear() + "/autox/" + axwareName + "_pax.htm", text: "Pax"}).appendTo(jqContainer);
}

function makeRow(rowData){
    var row = $("<div>", { class: "pure-g eventRow"});
    if (rowData.championship){
        row.addClass("championshipEvent");
    }
    var col = 0;
    row.append( $("<div>", {
        class: COLUMN_CLASSES[col++],
        text: rowData.displayDate,
    }));
    row.append( $("<div>", {
        class: COLUMN_CLASSES[col++],
        text: rowData.name,
    }));
    rowData.registrationJqElement = $("<div>", {
        class: COLUMN_CLASSES[col++]
    }).appendTo(row);

    rowData.resultsJqElement = $("<div>", {
        class: COLUMN_CLASSES[col++]
    }).appendTo(row);

    if (rowData.eventDateJs <= NOW && rowData.axwareName) {
        attachResultLinks(rowData.resultsJqElement, rowData.axwareName, rowData.eventDateJs);
    }
    return row;
}

function fixMessyMsrDateTimeString(input){
    var year = input.substring(0, 4);
    var month = parseInt(input.substring(5, 7)) - 1;
    var day = input.substring(8, 10);
    var hour = input.substring(11, 13);
    var min = input.substring(14, 16)
    var dateObject =  new Date(Date.UTC(year, month, day, hour, min));
    return dateObject;
}

function populateFromMsr(eventsWithMsrIds) {
    $.ajax('https://api.motorsportreg.com/rest/calendars/organization/2090ED02-A19B-3A7B-C58CBD1982CDCC4E.json?start=@YEAR@-01-01&end=@YEAR@-12-31'.replace(/@YEAR@/g, YEAR), {
        async: true,
        cache: false,
        dataType: 'json',
    }).done(
        function(json){
            $.each(json.response.events, function(key, value){
                var msrId = value.id;
                if (eventsWithMsrIds[msrId]) {
                    var regElement = eventsWithMsrIds[msrId].registrationJqElement.html("");
                    var start = fixMessyMsrDateTimeString(value.registration.start);
                    var end = fixMessyMsrDateTimeString(value.registration.end);
                    if (start > NOW) {
                        regElement.text(
                            "Preregistration opens on " + start.toLocaleDateString()
                        );
                    } else { 
                        var link = $("<a>", {
                            href: value.detailuri,
                            target: "motrosportsreg",
                        });
                        regElement.append(link);
                        if (end > NOW) {
                            link.text("Preregister Now");
                            regElement.append(" (closes&nbsp;on&nbsp;" + end.toLocaleDateString() + ") ");
                        } else {
                            link.text("Preregistration Closed");
                            regElement.append(" ");
                        }
                        var msrMetadataElement = $("<span>").append("<span class='fas fa-spinner fa-pulse'>");
                        regElement.append(msrMetadataElement);
                        populateRegistered(msrMetadataElement, msrId);
                    }
                }
            });
        }
    );
}
})();
