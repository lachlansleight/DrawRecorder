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
                            backgroundColor: "#ffffff",
                            border: (color === "default"
                                ? "2px solid black"
                                : "none")
                        }} 
                        onClick={() => setColor("default")}></li>
                    <li 
                        style={{
                            backgroundColor: "#d03428",
                            border: (color === "red"
                                ? "2px solid black"
                                : "none")
                        }} 
                        onClick={() => setColor("red")}></li>
                    <li 
                        style={{
                            backgroundColor: "#1974fd",
                            border: (color === "blue"
                                ? "2px solid black"
                                : "none")
                        }} 
                        onClick={() => setColor("blue")}></li>
                    <li 
                        style={{
                            backgroundColor: "#41c30f",
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