import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Landing from './pages/Landing';
import { Player } from './pages/Player';
import { Dealer } from './pages/Dealer';
import { PlayerFinal } from './pages/PlayerFinal';
import { DealerFinal } from './pages/DealerFinal';
import { Admin } from './pages/Admin';

function App() {
  return (
    <div className="App bg_pattern bg_custom">
      <Routes>
        <Route path="" element={<Landing />} />
        <Route path='/admin' element={<Admin />} />
        <Route path="/home" element={<Home />} />
        <Route path="/player" element={<Player />} />
        <Route path="/dealer" element={<Dealer />} />
        <Route path='/player/final' element={<PlayerFinal />} />
        <Route path='/dealer/final' element={<DealerFinal />} />
      </Routes>    
    </div>
  );
}
export default App;
