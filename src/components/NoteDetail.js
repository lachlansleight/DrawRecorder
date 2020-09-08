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
                ctx.lineWidth = stroke.width
                ctx.strokeStyle = stroke.color
                const points = stroke.points;

                ctx.beginPath()
                ctx.moveTo(points[0].p.x, points[1].p.y)

                for(let i = 1; i < points.length; i++) {
                    if(stroke.time + points[i].t > time) continue;
                    ctx.quadraticCurveTo(points[i - 1].p.x, points[i - 1].p.y, points[i].p.x, points[i].p.y)
                    ctx.stroke()

                    if(i !== points.length - 1) {
                        ctx.beginPath()
                        ctx.moveTo(points[i].p.x, points[i].p.y)
                    }
                }
            })
    }

    useEffect(() => {
        if(!canvasContext) return;
        if(!note) return;

        const lastTime = note.strokes[note.strokes.length - 1].time + 1000;
        let time = 0;
        let intervalId;

        const frame = () => {
            if(time >= lastTime || !autoDraw) clearInterval(intervalId);
            if(autoDraw) setDrawTime(time);
            time += 20;
        }
        intervalId = setInterval(frame, 20);

        return(() => clearInterval(intervalId));
    }, [canvasContext, note, autoDraw])

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