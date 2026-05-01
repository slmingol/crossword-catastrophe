import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PuzzlePlay from './pages/PuzzlePlay';
import Archive from './pages/Archive';
import Layout from './components/Layout';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/puzzle/:id" element={<PuzzlePlay />} />
        <Route path="/archive" element={<Archive />} />
      </Routes>
    </Layout>
  );
}

export default App;
