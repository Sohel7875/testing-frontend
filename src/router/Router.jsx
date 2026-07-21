import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Home from '../screens/Home';
import SlotMachine from '../screens/SlotMachine';

const Router = () => (
  <Routes>
    {/* Stake-style shell: navbar + sidebar + home */}
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/casino" element={<Home />} />
    </Route>

    {/* Full-screen game (no shell) */}
    <Route path="/slot-machine" element={<SlotMachine />} />

    {/* Any unknown path → home */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default Router;
