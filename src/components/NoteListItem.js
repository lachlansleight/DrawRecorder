import React from 'react'
import {Link} from 'react-router-dom'

import moment from 'moment'

const NoteListItem = ({note}) => {

    if(!note) return <div>No Note</div>

    return (
        <Link className="note-list-item" to={`/notes/${note.id}`}>
            <h4>{note.name}</h4>
            <p>{moment(note.timestamp).format("Do MMMM YYYY - h:mm A")}</p>
            <p>{note.strokeCount} Strokes, {note.pointCount} Points</p>
        </Link>
    )
}

export default NoteListItem;