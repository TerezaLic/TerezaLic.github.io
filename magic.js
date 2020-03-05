/*
 * start: https://syrup.keboola.com/orchestrator/orchestrations/$orchestrationId/jobs POST
 * status: https://syrup.keboola.com/orchestrator/jobs/$jobId GET
 */

var orchestrationId = urlParam("id");
var token = urlParam("token");
var waiting = 0;
var loop;
jobId = "115172724";

function urlParam (name) {
    return unescape(window.location.search
                    .replace(new RegExp("^(?:.*[&\\?]" + escape(name)
                    .replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
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
        $("a#start").html("failed")
            .removeClass("waiting processing")
            .addClass("cancelled");
    });
}

$(document).ready(function() {
    $("a#start.info").click( function() {
        if($(this).hasClass("info")) checkStatus();
        return false;
    });
});
