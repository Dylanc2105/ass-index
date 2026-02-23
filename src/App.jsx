import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'

import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Play from './pages/Play.jsx'
import OfficialTable from './pages/OfficialTable.jsx'
import DatabaseEditor from './pages/DatabaseEditor.jsx'
import backgroundTexture from './assets/placeholders/Background.svg'

function AppShell() {
  const location = useLocation()

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050507] text-white">
      <img
        src={backgroundTexture}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50"
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className={`flex-1 px-6 pt-2 ${location.pathname === '/' ? 'pb-10 md:pb-12' : 'pb-16'}`}>
          <div key={location.pathname} className="page-transition h-full">
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/play" element={<Play />} />
              <Route path="/official" element={<OfficialTable />} />
              <Route path="/editor" element={<DatabaseEditor />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
