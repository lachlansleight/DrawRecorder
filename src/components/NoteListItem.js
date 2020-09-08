import React from 'react'
import {Link} from 'react-router-dom'

import moment from 'moment'

const NoteListItem = ({note}) => {

    if(!note) return <div>No Note</div>

    return (
        <Link className="note-list-item" to={`/notes/${note.id}`}>
            <h4>{moment(note.timestamp).format("h:mm A - Do MMMM YYYY")}</h4>
            <p>{note.strokeCount} Strokes, {note.pointCount} Points</p>
        </Link>
    )
}

export default NoteListItem;