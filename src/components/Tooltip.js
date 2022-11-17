import { useState, useEffect } from 'react'
import * as d3 from "d3"

export const handleMouseOver = function (tooltipContent) {

    if (tooltipContent.variableName) {
        let before = tooltipContent.variableName.split(":")[0] //e.g. End Uses/Feedstock
        let after = tooltipContent.variableName.split(": ")[1] //e.g. Biomass

        let tooltipValue = ''

        if (before == 'Feedstock') {
            //Feedstocks
            if (tooltipContent.value == "true" || tooltipContent.value == true || tooltipContent.value == "TRUE") {
                tooltipValue = after + " is a feedstock"
            } else if (tooltipContent.value == "false" || tooltipContent.value == false || tooltipContent.value == "FALSE") {
                tooltipValue = after + " is not a feedstock"
            } else {
                //null
                tooltipValue = after + " use as a feedstock unknown"
            }
        } else if (before == 'End Uses') {
            //End uses
            if (tooltipContent.value == "true" || tooltipContent.value == true || tooltipContent.value == "TRUE") {
                tooltipValue = after + " is an end use"
            } else if (tooltipContent.value == "false" || tooltipContent.value == false || tooltipContent.value == "FALSE") {
                tooltipValue = after + " is not an end use"
            } else {
                //null
                tooltipValue = after + " end use status unknown"
            }
        } else {
            if (tooltipContent.value == "Public" || tooltipContent.value == "PUBLIC") {
                tooltipValue = "Public partnership"
            } else if (tooltipContent.value == "Private" || tooltipContent.value == "PRIVATE") {
                tooltipValue = "Private partnership"
            } else {
                tooltipValue = "Public-private partnership"
            } 
        }

        let variableClassName = ''
        if (tooltipContent.value == 'Public-Private') {
            variableClassName = "mixed"
        } else if (tooltipContent.value == 'Public') { 
            variableClassName = "public"
        } else if (tooltipContent.value == 'Private') {
            variableClassName = "private"
        } else { 
            variableClassName = tooltipContent.value
        }

        d3.select("#tooltip")
            .style("display", "block")
            .style("background-color", "#FFFFFF")
            .html(

                `<h2>` + tooltipContent.name + `</h2>
            <div class='` + variableClassName + ` variable'>` + tooltipValue + `</div>
        <div class='secondary'>`+ tooltipContent.description + `</div>
        <div class='divider'></div>
        <div class='minor-label'>Lead Partner</div>
        <div class='minor'>` + tooltipContent.lead + `</div>
        <div class='divider'></div>
        <div class='minor-label'>Click on the hub for more information</div>`
            )
    }


}

// hide tooltip as mouse leaves region
export const handleMouseOut = function () {
    d3.select("#tooltip").style("display", "none")
}

// get mouse location so tooltip tracks cursor
export const handleMouseMove = function (event) {

    //This will only work if map is centered
    if (window.innerWidth / 2 < event.pageX) {
        if (window.innerWidth >= 600) {
            d3.select("#tooltip")
                .style("left", event.pageX - 424 + "px")
        } else {
            d3.select("#tooltip")
                .style("left", event.pageX - 274 + "px")
        }
    } else {
        d3.select("#tooltip")
            .style("left", event.pageX + 12 + "px")
    }

    if (event.pageY > 350) { 
        d3.select("#tooltip")
            .style("top", event.pageY - 180 + "px")
    } else {
        d3.select("#tooltip")
            .style("top", event.pageY - 12 + "px")
    }

}

export const handleExit = (event) => {

    if (event.target.id == "exit" || event.target.id == "largetooltip") {
        d3.select("#largetooltip")
        .style("display", "none")
    }
}

export const handleClick = function (tooltipContent) {
    d3.select("#tooltip")
        .style("display", "none")

    if (tooltipContent.variableName) {
        let before = tooltipContent.variableName.split(":")[0] //e.g. End Uses/Feedstock
        let after = tooltipContent.variableName.split(": ")[1] //e.g. Biomass

        let tooltipValue = ''

        if (before == 'Feedstock') {
            //Feedstocks
            if (tooltipContent.value == "true" || tooltipContent.value == true || tooltipContent.value == "TRUE") {
                tooltipValue = after + " is a feedstock"
            } else if (tooltipContent.value == "false" || tooltipContent.value == false || tooltipContent.value == "FALSE") {
                tooltipValue = after + " is not a feedstock"
            } else {
                //null
                tooltipValue = after + " use as a feedstock unknown"
            }
        } else if (before == 'End Uses') {
            //End uses
            if (tooltipContent.value == "true" || tooltipContent.value == true || tooltipContent.value == "TRUE") {
                tooltipValue = after + " is an end use"
            } else if (tooltipContent.value == "false" || tooltipContent.value == false || tooltipContent.value == "FALSE") {
                tooltipValue = after + " is not an end use"
            } else {
                //null
                tooltipValue = after + " end use status unknown"
            }
        } else {
            if (tooltipContent.value == "Public" || tooltipContent.value == "PUBLIC") {
                tooltipValue = "Public partnership"
            } else if (tooltipContent.value == "Private" || tooltipContent.value == "PRIVATE") {
                tooltipValue = "Private partnership"
            } else {
                tooltipValue = "Public-private partnership"
            } 
        }

        let variableClassName = ''
        if (tooltipContent.value == 'Public-Private') {
            variableClassName = "mixed"
        } else if (tooltipContent.value == 'Public') { 
            variableClassName = "public"
        } else if (tooltipContent.value == 'Private') {
            variableClassName = "private"
        } else { 
            variableClassName = tooltipContent.value
        }

        d3.select("#largetooltip")
            .style("display", "block")

        d3.select("#inner")
            .html(
                `<h2 style='width:90%'>` + tooltipContent.name + `</h2>
            <div class='` + variableClassName + ` variable'>` + tooltipValue + `</div>
        <div class='secondary'>`+ tooltipContent.description + `</div>
        <div class='divider'></div>
        <div class='minor-label'>Lead Partner</div>
        <div class='minor'>` + tooltipContent.lead + `</div>
        <div class='minor-label'>Corporate Partners</div>
        <div class='minor'>` + tooltipContent.corporate + `</div> 
        <div class='minor-label'>Finance Partners</div>
        <div class='minor'>` + tooltipContent.finance + `</div>
        <div class='minor-label'>Government Partners</div>
        <div class='minor'>` + tooltipContent.government + `</div> 
        <div class='minor-label'>Nonprofit Partners</div>
        <div class='minor'>` + tooltipContent.nonprofit + `</div>
        <div class='minor-label'>Academic Partners</div>
        <div class='minor'>` + tooltipContent.academic + `</div>
        
        `

        )
                
        
    }

}
