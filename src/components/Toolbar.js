import React, {useState} from 'react'

const Toolbar = ({setMaxWidth, color, setColor, undo, redo, undoAvailable, redoAvailable, clear, save}) => {

    const [width, setWidth] = useState(1);

    return (
        <div className="toolbar">
            <div className="container">
                <input 
                    className="slider"
                    type="range" 
                    value={width}
                    min='1' 
                    max='10' 
                    onChange={e => {
                        setWidth(e.target.value);
                        setMaxWidth(e.target.value);
                    }}
                    />
                <ul>
                    <li 
                        style={{
                            backgroundColor: "white",
                            border: (color === "white"
                                ? "2px solid black"
                                : "none")
                        }} 
                        onClick={() => setColor("white")}></li>
                    <li 
                        style={{
                            backgroundColor: "red",
                            border: (color === "red"
                                ? "2px solid black"
                                : "none")
                        }} 
                        onClick={() => setColor("red")}></li>
                    <li 
                        style={{
                            backgroundColor: "blue",
                            border: (color === "blue"
                                ? "2px solid black"
                                : "none")
                        }} 
                        onClick={() => setColor("blue")}></li>
                    <li 
                        style={{
                            backgroundColor: "green",
                            border: (color === "green"
                                ? "2px solid black"
                                : "none")
                        }} 
                        onClick={() => setColor("green")}></li>
                </ul>
                <div>
                    <button disabled={!undoAvailable} onClick={() => undo()}>Undo</button>
                    <button disabled={!redoAvailable} onClick={() => redo()}>Redo</button>
                    <button onClick={() => clear()}>Clear</button>
                    <button onClick={() => save()}>Save</button>
                </div>
            </div>
        </div>
    )
}

export default Toolbar;