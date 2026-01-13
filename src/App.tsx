import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MovieSearch from './components/MovieSearch';
import MovieDetail from './components/MovieDetail';
import PersonDetail from './components/PersonDetail';
import FilterScreen from './components/FilterScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MovieSearch />} />
        <Route path="/filters" element={<FilterScreen />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/tv/:id" element={<MovieDetail />} />
        <Route path="/person/:id" element={<PersonDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

