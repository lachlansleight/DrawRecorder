import React, {useEffect, useState, useContext, useRef} from 'react'

//import {Link} from 'react-router-dom'

//import moment from 'moment'

import DataContext from '../DataContext'

const NoteDetail = ({match}) => {

    const {data} = useContext(DataContext);
    const [note, setNote] = useState(null);
    const [drawTime, setDrawTime] = useState(0);
    const [autoDraw, setAutoDraw] = useState(true);
    const [endTime, setEndTime] = useState(1);

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

    useEffect(() => {
        setNote(data.notes.find(note => note.id === match.params.id));
        
    }, [data, match.params.id, setNote])

    useEffect(() => {
        if(!note) return;

        const lastStroke = note.strokes.slice(-1)[0];
        const lastPoint = lastStroke.points.slice(-1)[0];
        setEndTime(lastStroke.time + lastPoint.t);

    }, [note])

    const mainCanvas = useRef(0);
    const [canvasContext, setCanvasContext] = useState(null);
    useEffect(() => {
        if(mainCanvas.current) {
            const ctx = mainCanvas.current.getContext('2d');
            if(ctx) {
                ctx.lineCap = 'round'
                ctx.lineJoin = 'round'
                setCanvasContext(ctx);
            }
        }
    }, [canvasContext])

    const drawCanvas = (ctx, strokes, time) => {
        ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

        strokes
            .filter(stroke => !time || stroke.time < time)
            .forEach(stroke => {
                const points = stroke.points;
                
                ctx.lineWidth = stroke.width * (1 + points[0].w)
                ctx.strokeStyle = colorToHex(stroke.color);

                ctx.beginPath()
                ctx.moveTo(points[0].p.x, points[0].p.y)

                for(let i = 2; i < points.length; i++) {
                    if(stroke.time + points[i].t > time) continue;
                    ctx.lineWidth = stroke.width * (1 + points[i].w);
                    
                    const centerX = (points[i - 1].p.x + points[i - 2].p.x) / 2;
                    const centerY = (points[i - 1].p.y + points[i - 2].p.y) / 2;
                    ctx.quadraticCurveTo(points[i - 2].p.x, points[i - 2].p.y, centerX, centerY)

                    if(i == points.length - 1) {
                        ctx.quadraticCurveTo(points[i-1].p.x, points[i-1].p.y, points[i].p.x, points[i].p.y);
                    }

                    ctx.stroke()
                    ctx.beginPath()
                    ctx.moveTo(centerX, centerY)
                }
            })
    }


    // const l = points.length - 1
    // const xc = (points[l].p.x + points[l - 1].p.x) / 2
    // const yc = (points[l].p.y + points[l - 1].p.y) / 2
    // canvasContext.lineWidth = strokeWeight * (1 + pressure);
    // canvasContext.quadraticCurveTo(points[l - 1].p.x, points[l - 1].p.y, xc, yc)
    // canvasContext.stroke()
    // canvasContext.beginPath()
    // canvasContext.moveTo(xc, yc)

    useEffect(() => {
        if(!canvasContext) return;
        if(!note) return;

        let time = 0;
        let intervalId;

        const frame = () => {
            if(time >= endTime || !autoDraw) {
                setAutoDraw(false);
                clearInterval(intervalId);
            }
            if(autoDraw) setDrawTime(time);
            time += 200;
        }
        intervalId = setInterval(frame, 20);

        return(() => clearInterval(intervalId));
    }, [canvasContext, note, autoDraw, endTime])

    useEffect(() => {
        if(!canvasContext || !note) return;

        drawCanvas(canvasContext, note.strokes, drawTime);

    }, [canvasContext, note, drawTime])

    return (
        <div>
            <div className="toolbar">
                <div className="container">
                    <button type="button" onClick={() => {
                        setAutoDraw(true);
                        setDrawTime(0);
                    }}>Skip to Start</button>
                    <input 
                        disabled={autoDraw}
                        type="range" 
                        min="0" 
                        max={endTime} 
                        value={drawTime} 
                        onChange={e => setDrawTime(e.target.value)}
                        style={{
                            width: "60%"
                        }}
                    />
                    <button type="button" onClick={() => {
                        setAutoDraw(false);
                        setDrawTime(endTime);
                    }}>Skip to End</button>
                </div>
            </div>
            <canvas ref={mainCanvas} width={window.innerWidth - 17} height={window.innerHeight-64}></canvas>
        </div>
    )

}

export default NoteDetail;