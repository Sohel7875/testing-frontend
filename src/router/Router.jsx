import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Home from '../screens/Home';
import GameDetail from '../screens/GameDetail';

const Router = () => (
  <Routes>
    {/* Stake-style shell: navbar + sidebar */}
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/casino" element={<Home />} />
      {/* Click a game → detail page → Launch / Demo → game runs in an iframe */}
      <Route path="/game/:code" element={<GameDetail />} />
    </Route>

    {/* Any unknown path → home */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default Router;
