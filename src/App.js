// import Dropdown from '/Dropdown/Dropdown'
// import USMap from './USMap/USMap'
import { useState, useEffect } from 'react'
import * as d3 from "d3"
import { createTheme, ThemeProvider } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import ListSubheader from '@mui/material/ListSubheader';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { handleMouseOver, handleMouseOut, handleMouseMove } from './components/Tooltip.js'
import { svg } from 'd3'

const App = () => {

    /* - - - - Theme - - - - */

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
    const raw_csv = 'https://gist.githubusercontent.com/RFForg/b816285deda2ba654a26128372327471/raw/d3079bc07855ad5ba13758d708464fc5bbc909b7/raw_csv_test_wrongvalues'

    const [mapData, setMapData] = useState({ data: {}, loading: true })
    const [data, setData] = useState(null)
    const [mapRatio, setMapRatio] = useState(0.67)

    const [backEnabled, setBackEnabled] = useState(false)
    const [partnershipSelected, setPartnershipSelected] = useState(false)

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
    const [formattedVariable, setFormattedVariable] = useState('a feedstock')

    const handleMenuChange = (event: SelectChangeEvent) => {
        setMapVariable(event.target.value);

        if (event.target.value.split(":")[0] == 'Feedstock') {
            setFormattedVariable('a feedstock')
        } else if (event.target.value.split(":")[0] == 'End Uses') {
            setFormattedVariable('an end use')
        }

        if (event.target.value == 'Partnership') {
            setPartnershipSelected(true)
        } else {
            setPartnershipSelected(false)
        }

    };
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

    /* - - Resetting Zoom - - */

    const resetZoom = () => {

        d3.json(mapUrl).then(data => {
            setMapData((prevState) => {
                return { ...prevState, data: data, loading: false };
            });
        })

        setBackEnabled(false)
    }

    /* - - - - Zooming - - - - */

    const checkZoom = (event) => {

        if (event.target.attributes.stateName.value) {
            if (event.target.attributes.stateName.value == 'Texas') {

                d3.json(mapUrl_tx).then(data => {
                    setMapData((prevState) => {
                        return { ...prevState, data: data, loading: false };
                    });
                })

                setBackEnabled(true)

            } else if (event.target.attributes.stateName.value == 'Idaho' || event.target.attributes.stateName.value == 'Washington' || event.target.attributes.stateName.value == 'Oregon') {

                d3.json(mapUrl_pnw).then(data => {
                    setMapData((prevState) => {
                        return { ...prevState, data: data, loading: false };
                    });
                })

                setBackEnabled(true)

            } else if (event.target.attributes.stateName.value == 'North Dakota') {

                d3.json(mapUrl_nd).then(data => {
                    setMapData((prevState) => {
                        return { ...prevState, data: data, loading: false };
                    });
                })

                setBackEnabled(true)

            } else {

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
                    "description": value[0]['Description'],
                    "lead": value[0]['Lead'],
                    "corporate": value[0]['Corporate'],
                    "finance": value[0]['Finance'],
                    "government": value[0]['Government'],
                    "nonprofit": value[0]['Nonprofit'],
                    "academic": value[0]['Academic']
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
                    } else if (value == "Public") {
                        //Hub is public partnership
                        fill = '#755EA6'
                    } else if (value == "Private") {
                        //Hub is private partnership
                        fill = '#F4A25F'
                    } else if (value == "Public-Private") {
                        //Hub is public-private partnership
                        fill = '#74645E'
                    } else {
                        //Hub is null
                        fill = '#c5ced3'
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
                    } else if (value == "Public") {
                        //Hub is public partnership
                        stroke = '#755EA6'
                    } else if (value == "Private") {
                        //Hub is private partnership
                        stroke = '#F4A25F'
                    } else if (value == "Public-Private") {
                        //Hub is public-private partnership
                        stroke = '#74645E'
                    } else {
                        stroke = '#c5ced3'
                        //null
                    }
                    return (
                        <path id={feature.properties.code} className={feature.geometry.type + " hover"} key={feature.properties.code} d={path(feature)} fill={fill} stroke={stroke} onMouseOver={() => { handleMouseOver(tooltipValues) }} onMouseOut={handleMouseOut} onScroll={handleMouseOut} onMouseMove={(event) => { handleMouseMove(event) }} />
                    )
                }

                if (feature.geometry.type == 'Point') {
                    if (value == "true") {
                        fill = '#50b161'
                    } else if (value == "false") {
                        fill = '#ff6663'
                    } else if (value == "Public") {
                        //Hub is public partnership
                        fill = '#755EA6'
                    } else if (value == "Private") {
                        //Hub is private partnership
                        fill = '#F4A25F'
                    } else if (value == "Public-Private") {
                        //Hub is public-private partnership
                        fill = '#74645E'
                    } else {
                        fill = '#c5ced3'
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
                    <path id={feature.properties.code} className={feature.geometry.type} stateName={feature.properties.name} key={feature.properties.code} d={path(feature)} fill={fill} stroke={stroke} onClick={(event) => { checkZoom(event) }} />
                )
            }



        })

        return (

            <div className='mapper'>
                <div className='controller'>
                    <ThemeProvider theme={rffTheme}>
                        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                            <InputLabel id="simple-select-label"></InputLabel>
                            <Select
                                color="primary"
                                size="small"
                                labelId="simple-select-label"
                                id="simple-select"
                                value={mapVariable}
                                displayEmpty
                                onChange={handleMenuChange}
                            >
                                <ListSubheader>Feedstocks</ListSubheader>
                                <MenuItem value="Feedstock: Renewables">Renewables</MenuItem>
                                <MenuItem value="Feedstock: Fossil Fuels + CCS">Fossil Fuels + CCS</MenuItem>
                                <MenuItem value="Feedstock: Nuclear">Nuclear</MenuItem>
                                <MenuItem value="Feedstock: Biomass">Biomass</MenuItem>
                                <ListSubheader>End Uses</ListSubheader>
                                <MenuItem value="End Uses: Industry">Industry</MenuItem>
                                <MenuItem value="End Uses: Transportation">Transportation</MenuItem>
                                <MenuItem value="End Uses: Power">Power</MenuItem>
                                <MenuItem value="End Uses: Residential and Commercial Heating">Residential + Commercial Heating</MenuItem>
                                <ListSubheader>Partnership Type</ListSubheader>
                                <MenuItem value="Partnership">Partnership Type</MenuItem>
                            </Select>
                        </FormControl>
                    </ThemeProvider>
                </div>
                {backEnabled && <div className='reset' onClick={() => { resetZoom() }}><div className='reset-button'>← Back to US Map</div></div>}
                <div className='canvas' id={backEnabled ? 'zoomed-canvas' : 'canvas'}>
                    <svg width={canvasWidth} height={canvasHeight} className='map-canvas'>
                        <g>
                            {theMap}
                        </g>
                    </svg>
                </div>
                <div className='legend-container'>
                    <div className='legend'>
                        {!partnershipSelected && <div className='legend-colors'>
                            <div className='legend-item'>
                                <div className='legend-icon true'>
                                </div>
                                <div className='legend-value'>{mapVariable.split(": ")[1]} is {formattedVariable}
                                </div>
                            </div>
                            <div className='legend-item'>
                                <div className='legend-icon false'>
                                </div>
                                <div className='legend-value'>{mapVariable.split(": ")[1]} is not {formattedVariable}
                                </div>
                            </div>
                            <div className='legend-item'>
                                <div className='legend-icon unknown'>
                                </div>
                                <div className='legend-value'>{mapVariable.split(": ")[1]} {formattedVariable.split(" ")[1]} status unknown
                                </div>
                            </div>
                        </div>}
                        {partnershipSelected && <div className='legend-colors'>
                            <div className='legend-item'>
                                <div className='legend-icon public'>
                                </div>
                                <div className='legend-value'>Public Partnership
                                </div>
                            </div>
                            <div className='legend-item'>
                                <div className='legend-icon private'>
                                </div>
                                <div className='legend-value'>Private Partnership
                                </div>
                            </div>
                            <div className='legend-item'>
                                <div className='legend-icon mixed'>
                                </div>
                                <div className='legend-value'>Public-Private Partnership
                                </div>
                            </div>
                        </div>}

                        <div className='legend-shapes'>
                            <div className='legend-item'>
                                <div className='legend-icon state'>
                                </div>
                                <div className='legend-value'>State or Multi-State Hub
                                </div>
                            </div>
                            <div className='legend-item'>
                                <div className='legend-icon within'>
                                </div>
                                <div className='legend-value'>Hub within a State
                                </div>
                            </div>
                            <div className='legend-item'>
                                <div className='legend-icon pipeline'>
                                </div>
                                <div className='legend-value'>Pipeline
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default App