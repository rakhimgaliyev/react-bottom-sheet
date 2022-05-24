import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {useState} from "react";
import {BottomSheetDialog} from "../.";

const App = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{background: '#000', height: 400}}>
          <button style={{paddingTop: 300}} onClick={() => setOpen(true)}>
            open
          </button>

        </div>
        <div style={{background: '#fff', height: 400}}>

        </div>
        <div style={{background: '#000', height: 400}}>

        </div>
      </div>

      <BottomSheetDialog
        open={open}
        setOpen={setOpen}
      >
        <div style={{height: 300}}>
          block
        </div>
        <button onClick={() => setOpen(false)}>close button</button>
      </BottomSheetDialog>
    </>
  );
};

ReactDOM.render(<App/>, document.getElementById('root'));
