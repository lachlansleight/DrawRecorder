import React, {useContext, useEffect, useState} from 'react'

import DataContext from '../DataContext'

import NoteListItem from './NoteListItem'

const Home = () => {

    const {data} = useContext(DataContext);
    const [noteList, setNoteList] = useState([]);

    useEffect(() => {
        if(!data.notes || data.notes.length === 0) {
            setNoteList(null);
            return;
        }
        let temp = [...data.notes];
        setNoteList(temp.reverse().map(note => {
            return <NoteListItem key={note.id} note={note} />
        }))
    }, [data])

    return (
        <div className="container">
        <h1>Notes</h1>
        <div className="note-list">
            {noteList ? noteList : null}
        </div>
        </div>
    )
}

export default Home;