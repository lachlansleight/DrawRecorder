import React, {useEffect, useContext, useState} from 'react'

import axios from 'axios'

import DataContext from "../DataContext"

//import moment from 'moment'

import './loading.css'

const LoadData = ({updateParentLoading}) => {

    const {updateData} = useContext(DataContext);
    const [loading, updateLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            updateLoading(true);

            //Do requests
            let notes = await axios("https://ipadstrokerecorder.firebaseio.com/notes.json");
            if(!notes || !notes.data) {
                updateData({notes: []});
                updateLoading(false);
                return;
            }
            notes = Object.keys(notes.data).map(key => {
                return {...notes.data[key], id: key};
            }).map((note, index) => {
                return {...note, index};
            });

            updateData({notes});

            updateLoading(false);
        }
        fetchData();
    }, [updateData]);

    useEffect(() => {
        updateParentLoading(loading);
    }, [loading, updateParentLoading])

    return (
        <div className="container">
            {!loading ? null : (
                <div className="loading-container" style={{height: (window.innerHeight - 64) + "px"}}>
                    <div className="loading-spinner"></div>
                </div>
            )}
        </div>
    )
}

export default LoadData;