/*
 * start: https://syrup.keboola.com/orchestrator/orchestrations/$orchestrationId/jobs POST
 * status: https://syrup.keboola.com/orchestrator/jobs/$jobId GET
 */

var orchestrationId = urlParam("id");
var token = urlParam("token");
var waiting = 0;
var loop;

function urlParam (name) {
    return unescape(window.location.search
                    .replace(new RegExp("^(?:.*[&\\?]" + escape(name)
                    .replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}


function startOrch() {

    $("a#start").html("loading").addClass("info waiting").removeClass("button").attr("title", "");
    $.ajax({
        url: "https://syrup.eu-central-1.keboola.com/orchestrator/orchestrations/" + orchestrationId + "/jobs?limit=1",
        type: "get",
        headers: { "x-storageapi-token": token },
        dataType: "json"
        
    })
    .done(function(data) {
        var jobId = data[0]['id'];
        /*
        $("a#start").html(jobId)
            .removeClass("waiting processing")
            .addClass("cancelled");
            waiting = 0;
            */
        waiting = 1;
        loop = setInterval(function(){checkStatus(jobId)}, 5000);
    })
    .fail(function(data) {
        $("a#start").html("failed")
            .removeClass("waiting processing")
            .addClass("cancelled");
        waiting = 0;
    });

}

function checkStatus(jobId) {
    $.ajax({
        url: "https://syrup.eu-central-1.keboola.com/orchestrator/jobs/" + jobId,
        type: "get",
        headers: { "x-storageapi-token": token },
        dataType: "json"
    })
    .done(function(data) {
        switch(data.status) {
            case "waiting":
                $("a#start").html("waiting")
                    .addClass("waiting");
                break;
            case "processing":
                $("a#start").html("processing")
                    .removeClass("waiting")
                    .addClass("processing");
                break;
            case "success":
                $("a#start").html("success")
                    .removeClass("waiting processing")
                    .addClass("success");
                waiting = 0;
                break;
            case "canceled":
                $("a#start").html("cancelled")
                    .removeClass("waiting processing")
                    .addClass("cancelled");
                waiting = 0;
                break;
            case "error":
            default:
                $("a#start").html("error")
                    .removeClass("waiting processing")
                    .addClass("error");
                waiting = 0;
                break;
        }
        if(!waiting) clearInterval(loop);
    })
    .fail(function(data) {
        $("a#start").html("nefunguje")
            .removeClass("waiting processing")
            .addClass("cancelled");
    });
}

$(document).ready(function() {
     startOrch();
});


