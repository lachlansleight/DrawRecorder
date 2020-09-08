import React, {useEffect, useState, useContext, useRef} from 'react'

//import {Link} from 'react-router-dom'

//import moment from 'moment'

import DataContext from '../DataContext'

const NoteDetail = ({match}) => {

    const {data} = useContext(DataContext);
    const [note, setNote] = useState(null);

    useEffect(() => {
        setNote(data.notes.find(note => note.id === match.params.id));
        
    }, [data, match.params.id, setNote])

    useEffect(() => {
        if(!note) return;

        
    }, [note])

    const mainCanvas = useRef(0);
    const [canvasContext, setCanvasContext] = useState(null);
    const [canvasPos, setCanvasPos] = useState({x: 0, y: 0});
    useEffect(() => {
        console.log(mainCanvas.current);
        if(mainCanvas.current) {
            const ctx = mainCanvas.current.getContext('2d');
            const rect = mainCanvas.current.getBoundingClientRect();
            setCanvasPos({x: rect.left, y: rect.top});
            if(ctx) {
                ctx.lineCap = 'round'
                ctx.lineJoin = 'round'
                setCanvasContext(ctx);
            }
        }
    }, [canvasContext])

    useEffect(() => {
        if(!canvasContext) return;
        if(!note) return;

        note.strokes.forEach(stroke => {
            canvasContext.lineWidth = stroke.width
            canvasContext.strokeStyle = stroke.color
            const points = stroke.points;

            canvasContext.beginPath()
            canvasContext.moveTo(points[0].p.x, points[1].p.y)

            for(let i = 1; i < points.length; i++) {
                canvasContext.quadraticCurveTo(points[i - 1].p.x, points[i - 1].p.y, points[i].p.x, points[i].p.y)
                canvasContext.stroke()

                if(i !== points.length - 1) {
                    canvasContext.beginPath()
                    canvasContext.moveTo(points[i].p.x, points[i].p.y)
                }
            }
        })
    }, [canvasContext, note])

    const drawCanvas = (ctx, strokes) => {
        ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
        
    }

    return (
        <canvas ref={mainCanvas} width={window.innerWidth - 17} height={window.innerHeight-64}></canvas>
    )

}

export default NoteDetail;