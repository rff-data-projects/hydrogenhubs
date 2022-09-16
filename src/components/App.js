// import Dropdown from '/Dropdown/Dropdown'
// import USMap from './USMap/USMap'
import { useState, useEffect } from 'react'
import * as d3 from "d3"
import { StyledEngineProvider } from '@mui/material/styles';
import { ToggleButton } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { ToggleButtonGroup } from '@mui/material'
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
            // Name of the component ⚛️
            MuiButtonBase: {
                defaultProps: {
                    // The props to apply
                    disableRipple: true, // No more ripple, on the whole application 💣!
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
    const raw_csv = 'https://gist.githubusercontent.com/rossvdl/c068ecac72897fae73f0b89a4df0a6f6/raw/c423107704bae2d4e57c4bfb2ece2a87732785c3/data.csv'

    const [mapData, setMapData] = useState({ data: {}, loading: true })
    const [data, setData] = useState(null)

    /* - - - - Dynamic canvas width - - - - */

    const [canvasHeight, setCanvasHeight] = useState(window.innerWidth * 0.8)
    const [canvasWidth, setCanvasWidth] = useState(window.innerWidth - 10)

    const handleWindowResize = () => {
        setCanvasWidth(window.innerWidth - 10)
        setCanvasHeight(window.innerWidth * 0.8) //adjust as needed
    };

    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);
        return () => window.removeEventListener('resize', handleWindowResize);
    });

    /* - - - - Toggle element - - - - */

    const [mapVariable, setMapVariable] = useState('Feedstock: Nuclear')

    const handleChange = (e, newValue) => {
        setMapVariable(newValue)
        console.log('change')
    }
    /* - - - - Map projection - - - - */

    const projection = d3.geoAlbers()

    const setMapProjection = function (mapData, canvasWidth, canvasHeight) {

        // adjust projection to fit area of map canvas
        projection
            .fitSize(
                [canvasWidth - 40, canvasHeight], mapData
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

        // d3.select("body")
        //     .append("div")
        //     .attr("id", "tooltip")
        //     .attr("style", "position: absolute; display: none");
    }, [])

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

            if (value[0]) {
                value = value[0][mapVariable]
            } else {
                value = null
            }


            let fill = '#A6B2BA'
            let stroke = '#A6B2BA'
            //geometry.type="Point" or "LineString" or "Polygon"

            if (feature.geometry.type == 'Polygon' || feature.geometry.type == 'MultiPolygon') {
                if (value == "true") {
                    fill = '#50b161'
                } else if (value == "false") {
                    fill = '#ff6663'
                } else {
                    fill = '#ffffff00'
                    //null
                }
                return (
                    <path id={feature.properties.code} className={feature.geometry.type} key={feature.properties.code} d={path(feature)} fill={fill} stroke={stroke} />
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
                    <path id={feature.properties.code} className={feature.geometry.type} key={feature.properties.code} d={path(feature)} fill={fill} stroke={stroke} />
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

                console.log(x, y)

                return (
                    <circle id={feature.properties.code} cx={x} cy={y} r={10} fill={fill} className={feature.geometry.type}></circle>
                )
            }
        })

        return (

            <div>
                <ThemeProvider theme={rffTheme}>
                    <div className='select'>
                        <div className='select-label'>
                            Choose a feedstock
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
                            Or choose end uses
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
                        <svg width={canvasWidth-40} height={canvasHeight} className='map-canvas'>
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