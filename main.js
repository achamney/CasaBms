window.setInterval(function() {
    refreshData();
}, 15000);
var totalNum = 7
function refreshData() {
    getData(function(data) {
        window.allData = data;
        var lastVolt = JSON.parse(JSON.stringify(data.voltages[data.voltages.length-1]));
        for(var all of data.voltages) {
            for (var i=all.v.length -1; i>=0;i--) {
                if (all.v[i] < 10) { // remove counting index
                    all.v.splice(i, 1);
                }
            }
            all.v = all.v.map(v=>v*1.2/255 + 3);
        }
        var lastVoltSep = [];
        for (var i=0;i<totalNum*2;i+=2) { // Fix array so it's sorted
            if (lastVolt.v[i] <= 6) {
                lastVoltSep.push({v:lastVolt.v[i+1], i:lastVolt.v[i]});
            } else 
            {
                var ind = lastVolt.v[i+1];
                if (ind == 0) {
                    ind = 7;
                }
                lastVoltSep.push({v:lastVolt.v[i], i:ind -1});
            }
        }
        lastVoltSep.sort((a, b)=> a.i - b.i > 0 ? 1 : -1);
        if (lastVoltSep[4].v < 30) {
            lastVoltSep[4].v += 255;
        }
        lastVoltSep.forEach(a=>a.v=a.v*1.2/255 + 3);
        lastVoltSep[0].v -= 0.15;
        lastVoltSep[1].v -= 0.13;
        lastVoltSep[2].v -= 0.11;
        lastVoltSep[3].v -= 0.03;
        lastVoltSep[4].v -= 0.35;
        lastVoltSep[5].v += 0.11;
        lastVoltSep[6].v -= 0.16;
        for (var i=0;i<totalNum;i++) {
            updateBars(lastVoltSep, i);
        }
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
    var lastInd = lastVolt[ind].v;
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
    var chart = new Chart(ctx, {
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