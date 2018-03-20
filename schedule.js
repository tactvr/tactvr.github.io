var NOW = new Date();

function generateSchedule(containerLocator, scheduleArray) {
    var jqContainer = $(containerLocator).empty();
    var eventsWithMsrIds = {};
    
    $.each(scheduleArray, function(key, value){ 
        value.eventDateJs = new Date(value.eventDate);
        $(containerLocator).append(makeRow(value));
        if (value.eventDateJs > NOW && value.msr_id){
            eventsWithMsrIds[value.msr_id] = value;
        }
    });
    populateFromMsr(eventsWithMsrIds);
}

function populateRegistered(jqElement, msrEventGUID) {
    $.ajax('https://api.motorsportreg.com/rest/events/' + msrEventGUID + '/entrylist.json', {
        async: true,
        cache: false,
        dataType: 'json',
    }).done(
        function(json){
            jqElement.attr("class", "");// kill the spinner
            jqElement.text('[' + json.response.recordset.total + ' registered]');
        }
    );
}

function attachResultLinks(jqContainer, axwareName){
    $("<a>", { href:"http://teamtac.org/archive/2018/autox/" + axwareName + "_fin.htm", text: "Final"}).appendTo(jqContainer);
    jqContainer.append(" - ");
    $("<a>", { href:"http://teamtac.org/archive/2018/autox/" + axwareName + "_raw.htm", text: "Raw"}).appendTo(jqContainer);
    jqContainer.append(" - ");
    $("<a>", { href:"http://teamtac.org/archive/2018/autox/" + axwareName + "_pax.htm", text: "Pax"}).appendTo(jqContainer);
}

function makeRow(rowData){
    var row = $("<div>", { class: "pure-g eventRow"});
    if (rowData.championship){
        row.addClass("championshipEvent");
    }
    row.append( $("<div>", {
        class: "pure-u-4-24",
        text: rowData.displayDate,
    }));
    row.append( $("<div>", {
        class: "pure-u-10-24",
        text: rowData.name,
    }));
    rowData.detailsJqElement = $("<div>", {
        class: "pure-u-8-24"
    }).appendTo(row);

    if (rowData.eventDateJs < NOW && rowData.axwareName) {
        attachResultLinks(rowData.detailsJqElement, rowData.axwareName);
    }
    return row;
}

function populateFromMsr(eventsWithMsrIds) {
    console.log(eventsWithMsrIds);
    //$.ajax('https://api.motorsportreg.com/rest/calendars/organization/2090ED02-A19B-3A7B-C58CBD1982CDCC4E.json?start=2018-01-01&end=2019-01-01', {
    $.ajax('https://api.motorsportreg.com/rest/calendars/organization/2090ED02-A19B-3A7B-C58CBD1982CDCC4E.json', {
        async: true,
        cache: false,
        dataType: 'json',
    }).done(
        function(json){
            $.each(json.response.events, function(key, value){
                console.log(value);
                var msrId = value.id;
                if (eventsWithMsrIds[msrId]){
                    var link = $("<a>", {
                        href: value.detailuri,
                        text: "Registration"
                    });
                    eventsWithMsrIds[msrId].detailsJqElement.html("");
                    eventsWithMsrIds[msrId].detailsJqElement.append(link);
                    eventsWithMsrIds[msrId].detailsJqElement.append(" ");
                    if (new Date(value.registration.end) < NOW){
                        link.text("Registration Closed");
                    }
                    populateRegistered($("<span class='fas fa-spinner fa-pulse'>").appendTo(eventsWithMsrIds[msrId].detailsJqElement), msrId);
                }
            });
        }
    );
}