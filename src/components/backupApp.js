// import Dropdown from '/Dropdown/Dropdown'
// import USMap from './USMap/USMap'
import { useState, useEffect } from 'react'
import * as d3 from "d3"
import { StyledEngineProvider } from '@mui/material/styles';
import { ToggleButton } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { ToggleButtonGroup } from '@mui/material'
import { handleMouseOver, handleMouseOut, handleMouseMove } from './Tooltip.js'
import { svg } from 'd3'

const App = () => {

    /* - - - - - Theme - - - - */

    const rffTheme = createTheme({
        palette: {
            primary: {
                main: '#04273c',
            },
            contrastThreshold: 1,
            tonalOffset: 0.5,
        },
        components: {
            MuiButtonBase: {
                defaultProps: {
                    disableRipple: true
                },
            },
        },
        typography: {
            fontFamily: [
                '-apple-system',
                'BlinkMacSystemFont',
                '"Segoe UI"',
                'Roboto',
                '"Helvetica Neue"',
                'Arial',
                'sans-serif',
                '"Apple Color Emoji"',
                '"Segoe UI Emoji"',
                '"Segoe UI Symbol"',
            ].join(','),
        }
    });

    /* - - - - Map data - - - - */

    const mapUrl = 'https://gist.githubusercontent.com/rossvdl/9600f80857b96b468ae0e935f0e2cb46/raw/8ae898e1e50299e8d7b9ebcd72489e6c9ae27caf/rffhydrogenhubsmap.json'
    const mapUrl_tx = 'https://gist.githubusercontent.com/RFForg/941887907899cd34a15e56c6610d858e/raw/c71bac0811e5721aa029978f831ab6a514c106f4/tx_hh.json'
    const mapUrl_pnw = 'https://gist.githubusercontent.com/yuzhuuu/7cd68468606d99c1d7ee6490f802c64b/raw/1187428e435155b57503eab0051efbbeac59631b/PNW.json'
    const mapUrl_nd = 'https://gist.githubusercontent.com/yuzhuuu/73ace02ab6b71b14b2c7bf00811f55b3/raw/b9e2ad68959007496dd7523aa222303188ff6be9/ND.json'
    const raw_csv = 'https://gist.githubusercontent.com/RFForg/4bba63b11cc93522e6eee71ef50ebdc0/raw/d6932020644290878fa7dcfd028c0650481edbda/hhdata.csv'

    const [mapData, setMapData] = useState({ data: {}, loading: true })
    const [data, setData] = useState(null)

    mapRatio = 0.78

    /* - - - - Dynamic canvas width - - - - */

    let initialWindow = window.innerWidth
    if (initialWindow > 900) {
        initialWindow = 900
    }

    const [canvasHeight, setCanvasHeight] = useState(initialWindow * mapRatio)
    const [canvasWidth, setCanvasWidth] = useState(initialWindow)

    const handleWindowResize = () => {
        if (window.innerWidth > 900) {
            setCanvasWidth(900)
            setCanvasHeight(900 * mapRatio) //adjust as needed
        } else {
            setCanvasWidth(window.innerWidth)
            setCanvasHeight(window.innerWidth * mapRatio) //adjust as needed
        }
    };

    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);
        return () => window.removeEventListener('resize', handleWindowResize);
    });

    /* - - - - Toggle element - - - - */

    const [mapVariable, setMapVariable] = useState('Feedstock: Renewables')

    const handleChange = (e, newValue) => {
        setMapVariable(newValue)
    }
    
    /* - - - - Map projection - - - - */

    const projection = d3.geoAlbers()

    const setMapProjection = function (mapData, canvasWidth, canvasHeight) {

        // adjust projection to fit area of map canvas
        projection
            .fitSize(
                [canvasWidth - 20, canvasHeight - 50], mapData
            )
        return projection
    }

    /* - - - - Map setup - - - - */

    //csvUrl ----> data
    useEffect(() => {
        d3.csv(raw_csv).then(setData)
    }, [])

    //mapUrl ----> mapData
    useEffect(() => {
        d3.json(mapUrl).then(data => {
            setMapData((prevState) => {
                return { ...prevState, data: data, loading: false };
            });
        })

        d3.select("body")
            .append("div")
            .attr("id", "tooltip")
            .attr("style", "position: absolute; display: none")
    }, [])

    /* - - - - Zooming - - - - */

    const checkZoom = (event) => {

        console.log('checked')

        if(event.target.attributes.stateName.value) {
            if (event.target.attributes.stateName.value == 'Texas') {

                d3.json(mapUrl_tx).then(data => {
                    setMapData((prevState) => {
                        return { ...prevState, data: data, loading: false };
                    });
                })

            } else if (event.target.attributes.stateName.value == 'Idaho') {

                d3.json(mapUrl_tx).then(data => {
                    setMapData((prevState) => {
                        return { ...prevState, data: data, loading: false };
                    });
                })

            } 

        }
        
        // if (event.target.attributes.stateName.value == 'Texas') {
        //     setMapData(mapUrl_tx)
        // }
        // if (stateName == 'Texas') {
        //     console.log('arrived')
        // }
    }

    if (mapData.loading || !data) {

        /* - - - - Loading - - - - */

        return (<div>Loading</div>)

        /* - - - - Content - - - - */

    } else {

        const path = d3.geoPath().projection(setMapProjection(mapData.data, canvasWidth, canvasHeight))

        //data['code'] should produce values like 'NYL'
        //feature.properties['code']

        const theMap = mapData.data.features.map(feature => {

            let value = data.filter(e => e['code'] == feature.properties['code'])

            let tooltipValues = ''
            
            //Check if there's data (if not, it's basemap, and set data to null)
            if (value[0]) {

                //Create tooltip values
                tooltipValues =
                {
                    "name": feature.properties.name,
                    "variableName": mapVariable,
                    "value": value[0][mapVariable],
                    "description": value[0]['Description']
                }

                value = value[0][mapVariable]
            } else {
                value = null
            }            

            //Fill and stroke default values
            let fill = '#A6B2BA'
            let stroke = '#A6B2BA'

            //First differentiate between hubs and the basemap; then segment geometry.type by "Point" or "LineString" or "Polygon" 
            if (feature.properties.hub == true) {

                if (feature.geometry.type == 'Polygon' || feature.geometry.type == 'MultiPolygon') {
                    if (value == "true") {
                        //Hub is true
                        fill = '#50b161'
                    } else if (value == "false") {
                        //Hub is false
                        fill = '#ff6663'
                    } else {
                        //Hub is null
                        fill = '#A6B2BA'
                    }
                    return (
                        <path id={feature.properties.code} className={feature.geometry.type + " hover"} key={feature.properties.code} d={path(feature)} fill={fill} stroke={stroke} onMouseOver={() => { handleMouseOver(tooltipValues) }} onMouseOut={handleMouseOut} onScroll={handleMouseOut} onMouseMove={(event) => { handleMouseMove(event) }} />
                    )
                }

                if (feature.geometry.type == 'LineString') {
                    fill = '#00000000'
                    if (value == "true") {
                        stroke = '#50b161'
                    } else if (value == "false") {
                        stroke = '#ff6663'
                    } else {
                        stroke = '#A6B2BA'
                        //null
                    }
                    return (
                        <path id={feature.properties.code} className={feature.geometry.type + " hover"} key={feature.properties.code} d={path(feature)} fill={fill} stroke={stroke} onMouseOver={() => { handleMouseOver(tooltipValues) }} onMouseOut={handleMouseOut} onScroll={handleMouseOut} onMouseMove={(event) => { handleMouseMove(event) }}/>
                    )
                }

                if (feature.geometry.type == 'Point') {
                    if (value == "true") {
                        fill = '#50b161'
                    } else if (value == "false") {
                        fill = '#ff6663'
                    } else {
                        fill = '#A6B2BA'
                        //null
                    }
                    const [x, y] = projection([feature.geometry.coordinates[0], feature.geometry.coordinates[1]])

                    return (
                        <circle id={feature.properties.code} cx={x} cy={y} r={10} fill={fill} className={feature.geometry.type + " hover"} onMouseOver={() => { handleMouseOver(tooltipValues) }} onMouseOut={() => handleMouseOut()} onScroll={handleMouseOut} onMouseMove={(event) => { handleMouseMove(event) }}></circle>
                    )
                }
            } else {
                //state basemap
                fill = '#ffffff'
                return (
                    <path id={feature.properties.code} className={feature.geometry.type} stateName={feature.properties.name} key={feature.properties.code} d={path(feature)} fill={fill} stroke={stroke} onClick={(event) => { checkZoom(event) }}/>
                )
            }



        })

        return (

            <div>
                <ThemeProvider theme={rffTheme}>
                    <div className='select'>
                        <div className='select-label'>
                            Choose a feedstock:
                        </div>
                        <ToggleButtonGroup
                            color="primary"
                            size="small"
                            value={mapVariable}
                            exclusive
                            onChange={handleChange}
                            aria-label="Platform"
                        >
                            <ToggleButton value="Feedstock: Renewables">Renewables</ToggleButton>
                            <ToggleButton value="Feedstock: Fossil Fuels + CCS">Fossil Fuels + CCS</ToggleButton>
                            <ToggleButton value="Feedstock: Nuclear">Nuclear</ToggleButton>
                            <ToggleButton value="Feedstock: Biomass">Biomass</ToggleButton>
                        </ToggleButtonGroup>
                    </div>
                    <div className='select'>
                        <div className='select-label'>
                            Or choose end uses:
                        </div>
                        <ToggleButtonGroup
                            color="primary"
                            size="small"
                            value={mapVariable}
                            exclusive
                            onChange={handleChange}
                            aria-label="Platform"
                        >
                            <ToggleButton value="End Uses: Industry">Industry</ToggleButton>
                            <ToggleButton value="End Uses: Transportation">Transportation</ToggleButton>
                            <ToggleButton value="End Uses: Power">Power</ToggleButton>
                            <ToggleButton value="End Uses: Residential and Commercial Heating">Residential + Commercial Heating</ToggleButton>
                        </ToggleButtonGroup>

                    </div>
                    <div className='canvas'>
                        <svg width={canvasWidth} height={canvasHeight} className='map-canvas'>
                            <g>
                                {theMap}
                            </g>
                        </svg>
                    </div>
                </ThemeProvider>
            </div>
        )
    }
}

export default App