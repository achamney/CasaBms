var JSONAPIURL = "https://jsonbox.io/box_609b743569a3ea29d275/5ee37517ba0293001738685f";
window.param = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

function getData(retFn) {
    $.get(`${JSONAPIURL}`, function (json) {
        try {
            //json = JSON.parse(json);
            window.data = json;
            retFn && retFn(json);
        } catch (e) {
            console.log(e);
            errorHandle();
        }
    }).fail(function () {
        errorHandle();
    });
}
function errorHandle() {
    alert("Error: Data Not Found. ");
}
function updateJsonData(id, data, callback) {
    $.ajax({
        url: `${JSONAPIURL}${id}`,
        type: "PUT",
        data: data,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data, textStatus, jqXHR) {
            callback(data);
        }
    });
}
function putData(data, callback) {
    $.ajax({
        url: JSONAPIURL,
        type: "POST",
        data: data,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(ret,ret2, ret3) {
            ret.uri = JSONAPIURL+"/" + ret._id;
            callback(ret);
        }
    });
}
function getRegData(url, retFn) {
    $.get(url, function (json) {
        if (!(json instanceof Object)) {
            json = JSON.parse(json);
        }
        retFn && retFn(json);
    });
}
