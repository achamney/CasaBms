window.setInterval(function() {
    refreshData();
}, 15000);
var totalNum = 7;
var divideFactor = 1.5;
var onoffcount = 1;
function inverterOn() {
    pingInverterRelay("on");
}
function inverterOff() {
    pingInverterRelay("off");
}
function pingInverterRelay(action) {
    var inverterPass = $("#inverterPass").val();
    localStorage.setItem("inverterPass", inverterPass);
    var url1 = atob("aHR0cDovLzE5Mi4xNjguMS40OjMwMDAv")+action+"?pass="+inverterPass+"&nocache="+onoffcount++;
    var url2 = atob("aHR0cDovL29tYm0uZGRucy5uZXQ6MzAwMC8")+action+"?pass="+inverterPass+"&nocache="+onoffcount++;
    $("<img src='"+url1+"'/>").appendTo($("body"));
    $("<img src='"+url2+"'/>").appendTo($("body"));
}
$("#inverterPass").val(localStorage.getItem("inverterPass"));
function refreshData() {
    getData(function(data) {
        window.allData = data;
        var lastVolt = data.voltages[data.voltages.length-1];
        for(var all of data.voltages) {
            all.v = all.v.map(v=>v*divideFactor/255 + 3);
            adjustVolts(all);
        }
        for (var i=0;i<totalNum;i++) {
            updateBars(lastVolt, i);
        }
        $("#titleText").html(lastVolt.v
            .reduce((a, b) => a + b).toFixed(2));
        data.voltages = data.voltages.map(all=> { return {
            "t": all.t, 
            "v": all.v.reduce((a, b)=>a + b)/totalNum
            }
        });
        refreshChart("voltChart", data.voltages, "v");
        refreshChart("tempChart", data.voltages, "t");
    });
}
function updateBars(lastVolt, ind) {
    var lastInd = lastVolt.v[ind];
    $("#voltContainer"+ind).html(lastInd.toFixed(2)+"v");
    var bar1w = (lastInd-3)/1.2 * 100;
    var bar2w = (4.2-lastInd)/1.2 * 100;
    $(".barl"+ind).css("width",bar1w+"%");
    $(".barr"+ind).css("width",bar2w+"%");
}
function refreshChart(id, data, datum) {
    var ctx = document.getElementById(id).getContext('2d');
    var time = new Date(allData._updatedOn);
    var timeWindow = 30;
    time = new Date(time - timeWindow * (data.length) * 1000);
    if (window["chart"+id]) {
        window["chart"+id].destroy();
    }
    window["chart"+id] = new Chart(ctx, {
        // The type of chart we want to create
        type: 'bar',

        // The data for our dataset
        data: {
            labels: data.map((d, i)=>{ time = new Date(time.getTime() + timeWindow*1000); 
                return time.getHours()+":"+formatTime(time.getMinutes());}),
            datasets: [{
                label: (datum == "v" ? "Volts" : "Temperature (C)"),
                backgroundColor: function(context){
                    var index = context.dataIndex;
                    var value = context.dataset.data[index];
                    if (datum == "v")
                        return getColorForPercentage(((value - 3)*2).toFixed(1)/2.2);
                    if (datum == "t")
                        return value>55 ? "#BA0" :
                                value >75 ? "red" :
                                "green";
                    return "#BA0";
                },
                borderColor: 'rgb(255, 99, 132)',
                data: data.map(d=>d[datum])
            }]
        },

        // Configuration options go here
        options: { title: {
                display: true,
                text: datum == "v" ? "Voltage Over Time" : "Temperature Over Time (C)"
            },
            legend: {display: false }
        }
    });
}
function formatTime(t) {
    return t <= 9 ? "0"+t : t;
}
function adjustVolts(obj) {
    obj.v[0] -= 0.03;

    if (obj.v[1] > 4.0)
        obj.v[1] -= 0.13;
    else 
        obj.v[1] -= 0.14;

    if (obj.v[2] > 4.0)
        obj.v[2] -= 0.085;
    else 
        obj.v[2] -= 0.13;

    if (obj.v[3] > 4.1)
        obj.v[3] -= 0.20;
    else 
        obj.v[3] -= 0.20;
    
    if (obj.v[4] > 4.0)
        obj.v[4] -= 0.01;
    else 
        obj.v[4] -= 0.01;

    if (obj.v[5] > 4.0)
        obj.v[5] -= 0.21;
    else 
        obj.v[5] -= 0.21;

    if (obj.v[6] > 4.1)
        obj.v[6] += 0.02;
    else 
        obj.v[6] += 0.02;
}
const percentColors = [
    { pct: 0.0, color: { r: 0xAA, g: 0x00, b: 0 } },
    { pct: 0.5, color: { r: 0xBB, g: 0xBB, b: 0x33 } },
    { pct: 1.0, color: { r: 0x00, g: 0xAA, b: 0 } } ];

const getColorForPercentage = function(pct) {
    let i;
    for (i = 1; i < percentColors.length - 1; i++) {
        if (pct < percentColors[i].pct) {
            break;
        }
    }
    const lower = percentColors[i - 1];
    const upper = percentColors[i];
    const range = upper.pct - lower.pct;
    const rangePct = (pct - lower.pct) / range;
    const pctLower = 1 - rangePct;
    const pctUpper = rangePct;
    const color = {
        r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
        g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
        b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
    };
    return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
    // or output as hex if preferred
};
refreshData();