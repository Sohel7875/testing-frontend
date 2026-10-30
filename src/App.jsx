import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import './App.css';
import GameContextProvidor from './context/GameContext';
import './index.css';

import { BrowserRouter } from 'react-router-dom';
import 'react-toastify/ReactToastify.css';
import Router from './router/Router';
import { warmUp } from './aggregator/api.js';


const App = () => {
  // Wake the (sleep-prone) operator backend as soon as the app loads, so it's
  // booting before the user reaches login/signup. Fire-and-forget, never throws.
  useEffect(() => { warmUp(); }, []);

  return (
    <BrowserRouter>
      <GameContextProvidor>
        <ToastContainer
          containerId="main-toast"
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          toastClassName="!z-[9999]"
        />

        <Router />
      </GameContextProvidor>

    </BrowserRouter>
  );
};

export default App;