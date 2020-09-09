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
    const [strokeWeight, setStrokeWeight] = useState(1);
    const [points, setPoints] = useState([]);
    const [strokes, setStrokes] = useState([]);
    const [mouseDown, setMouseDown] = useState(false);
    const [color, setColor] = useState("white");
    const [strokeMetadata, setStrokeMetadata] = useState(null);
    const [loading, setLoading] = useState(false);
    const [redoStack, setRedoStack] = useState([]);

    const colorToHex = color => {
        switch(color) {
            case 'red':
                return "#d03428";
            case 'blue':
                return "#1974fd";
            case 'green':
                return "#41c30f";
            case 'default':
                return "#ffffff";
            default:
                return "#ffffff";
        }
    }

    const addPoint = useCallback((x, y, w, t) => {
        const newPoint = {
            p: {x, y},
            w: w || 1,
            t: t === undefined ? moment().valueOf() - strokeFirstTime : t
        };
        setPoints(point => [...point, newPoint])
    }, [strokeFirstTime]);

    const handleStrokeStart = useCallback(e => {
        let pressure = 1;
        let x, y;
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
    
        setMouseDown(true);
    
        canvasContext.lineWidth = strokeWeight * (1 + pressure);
        canvasContext.strokeStyle = colorToHex(color);
        canvasContext.beginPath()
        canvasContext.moveTo(x, y)
    
        let first = firstTime;
        if(firstTime < 0) {
            first = moment().valueOf();
            setFirstTime(first);
        }

        setStrokeFirstTime(moment().valueOf());

        addPoint(x, y, pressure, 0);

        setStrokeMetadata({
            color,
            time: moment().valueOf() - first,
            width: strokeWeight
        });

        //can no longer redo anything!
        setRedoStack([]);

    }, [addPoint, canvasContext, firstTime, canvasPos, strokeWeight, color]);

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

        addPoint(x, y, pressure);

        if (points.length >= 3) {
            const l = points.length - 1
            const xc = (points[l].p.x + points[l - 1].p.x) / 2
            const yc = (points[l].p.y + points[l - 1].p.y) / 2
            canvasContext.lineWidth = strokeWeight * (1 + pressure);
            canvasContext.quadraticCurveTo(points[l - 1].p.x, points[l - 1].p.y, xc, yc)
            canvasContext.stroke()
            canvasContext.beginPath()
            canvasContext.moveTo(xc, yc)
        }
    }, [addPoint, canvasContext, mouseDown, points, canvasPos, strokeWeight]);

    const handleStrokeEnd = useCallback(e => {
        let x, y;
        let pressure;
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
    
        setMouseDown(false);
    
        if (points.length >= 3) {
            const l = points.length - 1
            canvasContext.lineWidth = strokeWeight * (1 + pressure);
            canvasContext.quadraticCurveTo(points[l].p.x, points[l].p.y, x, y)
            canvasContext.stroke()
        }
        addPoint(x, y, pressure);
    
        setStrokes(s => [...s, {...strokeMetadata, pointCount: points.length, points}]);
        setPoints([]);
    }, [canvasContext, points, canvasPos, strokeMetadata, strokeWeight]);

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
                ctx.lineCap = 'round'
                ctx.lineJoin = 'round'
            }
        }
    }, [canvasContext])

    const undo = () => {
        //add the most recent stroke onto the front of the redo stack
        setRedoStack([strokes.slice(-1)[0], ...redoStack]);

        //repopulate the canvas - do this first because react?
        redrawSketch(strokes.slice(0, strokes.length - 1));

        //remove the most recent stroke from the strokes array
        setStrokes(strokes.slice(0, strokes.length - 1));
    }

    const redo = () => {
        if(!redoStack || redoStack.length === 0) return;

        //add the first item from the redo stack onto the strokes array
        setStrokes([...strokes, redoStack[0]]);

        //repopulate the canvas - do this first because react?
        redrawSketch([...strokes, redoStack[0]]);

        //remove the first item from the redo stack
        setRedoStack(redoStack.slice(1));
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

    const redrawSketch = useCallback(strokes => {
        canvasContext.clearRect(0, 0, canvasContext.canvas.clientWidth, canvasContext.canvas.clientHeight);

        strokes
            .forEach(stroke => {
                const points = stroke.points;
                
                canvasContext.lineWidth = stroke.width * (1 + points[0].w)
                canvasContext.strokeStyle = colorToHex(stroke.color);

                canvasContext.beginPath()
                canvasContext.moveTo(points[0].p.x, points[0].p.y)

                for(let i = 2; i < points.length; i++) {
                    canvasContext.lineWidth = stroke.width * (1 + points[i].w);
                    
                    const centerX = (points[i - 1].p.x + points[i - 2].p.x) / 2;
                    const centerY = (points[i - 1].p.y + points[i - 2].p.y) / 2;
                    canvasContext.quadraticCurveTo(points[i - 2].p.x, points[i - 2].p.y, centerX, centerY)

                    if(i === points.length - 1) {
                        canvasContext.quadraticCurveTo(points[i-1].p.x, points[i-1].p.y, points[i].p.x, points[i].p.y);
                    }

                    canvasContext.stroke()
                    canvasContext.beginPath()
                    canvasContext.moveTo(centerX, centerY)
                }
            })
    }, [canvasContext]);

    const saveSketch = () => {
        const saveName = window.prompt("Enter name to save and clear. Leave blank to use current time as name");

        //click "cancel"
        if(saveName === null) return;


        const postData = async () => {

            setLoading(true);

            const finalData = {
                name: saveName === "" ? moment().format("Do MMMM YYYY - h:mmA") : saveName,
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
                window.location.href = process.env.PUBLIC_URL;
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
                setMaxWidth={newVal => setStrokeWeight(newVal)}
                color={color}
                setColor={newVal => setColor(newVal)}
                undo={undo}
                redo={redo}
                undoAvailable={strokes && strokes.length > 0}
                redoAvailable={redoStack && redoStack.length > 0}
                clear={clearSketch}
                save={saveSketch} 
            />
            }
            <canvas ref={mainCanvas} width={window.innerWidth - 17} height={window.innerHeight-64}></canvas>
        </div>
    )
}

export default RecordNote;