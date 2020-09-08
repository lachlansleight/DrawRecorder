import React, {useState, useEffect, /*useContext, */useRef, useCallback} from 'react'

import moment from 'moment'
import axios from 'axios'

import Toolbar from './Toolbar'

//import DataContext from '../DataContext';

const RecordNote = () => {
    //const {data} = useContext(DataContext);
    const mainCanvas = useRef(0);
    const [canvasContext, setCanvasContext] = useState(null);

    const [canvasPos, setCanvasPos] = useState({x: 0, y: 0});
    const [firstTime, setFirstTime] = useState(-1);
    const [strokeFirstTime, setStrokeFirstTime] = useState(-1);
    const [lineWidth, setLineWidth] = useState(1);
    const [maxLineWidth, setMaxLineWidth] = useState(1);
    const [points, setPoints] = useState([]);
    const [strokes, setStrokes] = useState([]);
    const [mouseDown, setMouseDown] = useState(false);
    const [color, setColor] = useState("white");
    const [strokeMetadata, setStrokeMetadata] = useState(null);
    const [loading, setLoading] = useState(false);
    const [curData, setCurData] = useState({
        force: 0,
        touchType: 0,
        radiusX: 0,
        radiusY: 0,
        rotationAngle: 0,
        altitudeAngle: 0,
        azimuthAngle: 0,
    })

    const addPoint = useCallback((x, y, t) => {
        setPoints(point => [...point, {
            p: {x, y},
            //w: lineWidth,
            t: t || moment().valueOf() - strokeFirstTime
        }])
    }, [lineWidth, firstTime]);

    const handleStrokeStart = useCallback(e => {
        //let pressure = 0.1;
        let x, y;
        if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
            //if (e.touches[0]["force"] > 0) {
            //    pressure = e.touches[0]["force"]
            //}
            x = e.touches[0].pageX - canvasPos.x
            y = e.touches[0].pageY - canvasPos.y
        } else {
            //pressure = 1.0
            x = e.pageX - canvasPos.x
            y = e.pageY - canvasPos.y
        }
    
        setMouseDown(true);
    
        //const newWidth = Math.log(pressure + 1) * maxLineWidth
        const newWidth = maxLineWidth;
        setLineWidth(newWidth);
        canvasContext.lineWidth = newWidth// pressure * 50;
        canvasContext.strokeStyle = color
        canvasContext.lineCap = 'round'
        canvasContext.lineJoin = 'round'
        canvasContext.beginPath()
        canvasContext.moveTo(x, y)
    
        let first = firstTime;
        if(firstTime < 0) {
            first = moment().valueOf();
            setFirstTime(first);
        }

        setStrokeFirstTime(moment().valueOf());

        addPoint(x, y, 0);

        setStrokeMetadata({
            color,
            time: moment().valueOf() - first,
            width: maxLineWidth
        });
    }, [addPoint, canvasContext, firstTime, canvasPos, maxLineWidth, color]);

    const handleStrokeMove = useCallback(e => {
        if (!mouseDown) return;
        e.preventDefault()

        let pressure;
        let x, y
        if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
            if (e.touches[0]["force"] > 0) {
                pressure = e.touches[0]["force"]
            }
            x = e.touches[0].pageX - canvasPos.x
            y = e.touches[0].pageY - canvasPos.y
        } else {
            pressure = 1.0
            x = e.pageX - canvasPos.x
            y = e.pageY - canvasPos.y
        }

        // smoothen line width
        //setLineWidth((Math.log(pressure + 1) * maxLineWidth * 0.2 + lineWidth * 0.8))
        setLineWidth(maxLineWidth);

        // if(points.length > 0) {
        //     const lastTime = points[points.length - 1].t;
        //     const newTime = moment().valueOf() - firstTime;
        //     if(newTime - lastTime < 10) return;
        //     addPoint(x, y, newTime);
        // } else addPoint(x, y);

        addPoint(x, y);

        canvasContext.strokeStyle = color
        canvasContext.lineCap = 'round'
        canvasContext.lineJoin = 'round'
        // canvasContext.lineWidth   = lineWidth// pressure * 50;
        // canvasContext.lineTo(x, y);
        // canvasContext.moveTo(x, y);

        if (points.length >= 3) {
            const l = points.length - 1
            const xc = (points[l].p.x + points[l - 1].p.x) / 2
            const yc = (points[l].p.y + points[l - 1].p.y) / 2
            canvasContext.lineWidth = points[l - 1].w
            canvasContext.quadraticCurveTo(points[l - 1].p.x, points[l - 1].p.y, xc, yc)
            canvasContext.stroke()
            canvasContext.beginPath()
            canvasContext.moveTo(xc, yc)
        }

        const touch = e.touches ? e.touches[0] : null
        if (touch) {
            setCurData({
                force : pressure,
                touchType : `${touch.touchType} ${touch.touchType === 'direct' ? '👆' : '✍️'}`,
                radiusX : `${touch.radiusX}`,
                radiusY : `${touch.radiusY}`,
                rotationAngle : `${touch.rotationAngle}`,
                altitudeAngle : `${touch.altitudeAngle}`,
                azimuthAngle : `${touch.azimuthAngle}`,
            })

            // 'touchev = ' + (e.touches ? JSON.stringify(
            //   ['force', 'radiusX', 'radiusY', 'rotationAngle', 'altitudeAngle', 'azimuthAngle', 'touchType'].reduce((o, key) => {
            //     o[key] = e.touches[0][key]
            //     return o
            //   }, {})
            // , null, 2) : '')
        } else {
            setCurData({
                force : pressure,
                touchType : 0,
                radiusX : 0,
                radiusY : 0,
                rotationAngle : 0,
                altitudeAngle : 0,
                azimuthAngle : 0,
            })
        }
    }, [addPoint, canvasContext, lineWidth, mouseDown, points, maxLineWidth, canvasPos, firstTime, color]);

    const handleStrokeEnd = useCallback(e => {
        let x, y;
        if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
            x = e.touches[0].pageX - canvasPos.x
            y = e.touches[0].pageY - canvasPos.y
        } else {
            x = e.pageX - canvasPos.x
            y = e.pageY - canvasPos.y
        }
    
        setMouseDown(false);
    
        canvasContext.strokeStyle = color
        canvasContext.lineCap = 'round'
        canvasContext.lineJoin = 'round'
    
        if (points.length >= 3) {
            const l = points.length - 1
            canvasContext.quadraticCurveTo(points[l].x, points[l].y, x, y)
            canvasContext.stroke()
        }
    
        setStrokes(s => [...s, {...strokeMetadata, pointCount: points.length, points}]);
        setPoints([]);
        setLineWidth(0);
    }, [canvasContext, points, canvasPos, color]);

    useEffect(() => {
        const canvas = mainCanvas.current;
        for (const ev of ["touchstart", "mousedown"]) {
            mainCanvas.current.addEventListener(ev, handleStrokeStart);
        }

        for (const ev of ['touchmove', 'mousemove']) {
            mainCanvas.current.addEventListener(ev, handleStrokeMove);
        }

        for (const ev of ['touchend', 'touchleave', 'mouseup']) {
            mainCanvas.current.addEventListener(ev, handleStrokeEnd);
        };

        return () => {
            for (const ev of ["touchstart", "mousedown"]) {
                canvas.removeEventListener(ev, handleStrokeStart);
            }
    
            for (const ev of ['touchmove', 'mousemove']) {
                canvas.removeEventListener(ev, handleStrokeMove);
            }
    
            for (const ev of ['touchend', 'touchleave', 'mouseup']) {
                canvas.removeEventListener(ev, handleStrokeEnd);
            };
        }
    }, [handleStrokeStart, handleStrokeMove, handleStrokeEnd]);

    useEffect(() => {
        if(mainCanvas.current) {
            const ctx = mainCanvas.current.getContext('2d');
            const rect = mainCanvas.current.getBoundingClientRect();
            setCanvasPos({x: rect.left, y: rect.top});
            if(ctx) {
                setCanvasContext(ctx);
            }
        }
    }, [canvasContext])

    const undo = () => {
        setStrokes(strokes.slice(0, strokes.length - 2));
    }

    const clearSketch = (skipWarning) => {
        if(!skipWarning) {
            if(!window.confirm("Clear Canvas?")) return;
        }
        if(canvasContext) canvasContext.clearRect(0, 0, canvasContext.canvas.clientWidth, canvasContext.canvas.clientHeight);
        setPoints([]);
        setStrokes([]);
        setFirstTime(-1);
        setStrokeFirstTime(-1);
    }

    const saveSketch = () => {
        if(!window.confirm("Save and clear Canvas?")) return;
        const postData = async () => {

            setLoading(true);

            const finalData = {
                timestamp: firstTime,
                strokeCount: strokes.length,
                pointCount: strokes.reduce((acc, s) => {
                    return s.points && s.points.length ? acc + s.points.length : acc;
                }, 0),
                strokes
            };

            try {
                const response = await axios.post("https://ipadstrokerecorder.firebaseio.com/notes.json", finalData);
                console.log("Post Successful", response.data);
            } catch (err) {
                console.log("Post failed", err);
            }

            clearSketch(true);
            setLoading(false);
        }

        postData();
    }

    return (
        <div>
            { loading 
            ? <div className="toolbar"><h1 style={{width: "100%", textAlign: "center"}}>Saving</h1></div> 
            : <Toolbar
                setMaxWidth={newVal => setMaxLineWidth(newVal)}
                color={color}
                setColor={newVal => setColor(newVal)}
                undo={undo}
                clear={clearSketch}
                save={saveSketch} 
            />
            }
            <canvas ref={mainCanvas} width={window.innerWidth - 17} height={window.innerHeight-64}></canvas>
        </div>
    )
}

export default RecordNote;