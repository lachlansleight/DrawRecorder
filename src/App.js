import React, {useMemo, useState} from 'react';
import {Route, Switch} from 'react-router-dom'

import Navbar from './components/Navbar'
import LoadData from './components/LoadData'
import Home from './components/Home'
import NoteDetail from './components/NoteDetail'
import RecordNote from './components/RecordNote'

import DataContext from './DataContext'

function App() {

  const [data, updateData] = useState({sessions: []});
  const [loading, updateLoading] = useState(true);

  const dataProviderValue = useMemo(() => ({data, updateData}), [data, updateData]);

  return (
    <div className="App">
      <DataContext.Provider value={dataProviderValue}>
        <Navbar/>

        {loading ? <LoadData updateParentLoading={updateLoading} /> : (
          <Switch>
            <Route exact path={`/`} component={Home} />
            <Route exact path="/notes/record" component={RecordNote} />
            <Route path={`/notes/:id`} component={NoteDetail} />
          </Switch>
        )}
      </DataContext.Provider>
    </div>
  );
}

export default App;
