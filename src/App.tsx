import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import FormPage from './pages/FormPage'
import Settings from './pages/Settings'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/form/:id" element={<FormPage />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

export default App
