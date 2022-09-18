
import * as d3 from "d3";

export const handleMouseOver = function (tooltipContent) {


    let before = tooltipContent.variableName.split(":")[0] //e.g. End Uses/Feedstock
    let after = tooltipContent.variableName.split(": ")[1] //e.g. Biomass

    let tooltipValue = ''

    if (before == 'Feedstock') {
        //Feedstocks
        if (tooltipContent.value == "true") {
            tooltipValue = after + " is a feedstock"
        } else if (tooltipContent.value == "false") {
            tooltipValue = after + " is not a feedstock"
        } else {
            //null
            tooltipValue = after + " use as a feedstock unknown"
        }
    } else {
        //End uses
        if (tooltipContent.value == "true") {
            tooltipValue = after + " is an end use"
        } else if (tooltipContent.value == "false") {
            tooltipValue = after + " is not an end use"
        } else {
            //null
            tooltipValue = after + " end use status unknown"
        }
    }

    d3.select("#tooltip")
        .style("display", "block")
        .style("background-color", "#FFFFFF")
        .html(

            `<h2>` + tooltipContent.name + `</h2>
            <div class='` + tooltipContent.value + ` variable'>`+ tooltipValue + `</div>
        <div class='secondary'>`+ tooltipContent.description + `</div>`

        )
}

// hide tooltip as mouse leaves region
export const handleMouseOut = function () {
    d3.select("#tooltip").style("display", "none")
}

// get mouse location so tooltip tracks cursor
export const handleMouseMove = function (event) {
    d3.select("#tooltip") //need to make this more specific to this viz
        .style("left", event.pageX + 12 + "px")
        .style("top", event.pageY - 2 + "px")
}