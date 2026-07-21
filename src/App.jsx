import { ToastContainer } from 'react-toastify';
import './App.css';
import GameContextProvidor from './context/GameContext';
import './index.css';

import { BrowserRouter } from 'react-router-dom';
import 'react-toastify/ReactToastify.css';
import Router from './router/Router';


const App = () => {

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