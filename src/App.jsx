import { useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import './App.css'
import Nav from './Components/Nav'
import Home from './Pages/Home'
import AboutMe from './Pages/AboutMe'
import WorkCase from './Components/WorkCase'
import Cursor from './Components/Cursor'

// Jump to the top whenever the route changes, so a case page
// doesn't open at the scroll position you clicked from.
function ScrollToTop({ lenisRef }) {
  const { pathname } = useLocation()

  useEffect(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname, lenisRef])

  return null
}

function App() {
  const lenisRef = useRef(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      touchMultiplier: 1.6,
    })
    lenisRef.current = lenis

    let frame
    const raf = (time) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return (
    <Router>
      <ScrollToTop lenisRef={lenisRef} />
     
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutMe />} />
        <Route path="/work" element={<div style={{ minHeight: '100vh', background: '#f3f3f1' }} />} />
        <Route path="/work/:slug" element={<WorkCase />} />
      </Routes>
    </Router>
  )
}

export default App