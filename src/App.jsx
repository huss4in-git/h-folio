import { useEffect } from 'react'
import Lenis from 'lenis'
import './App.css'
import AboutSection from './Components/About'
import Footer from './Components/Footer'
import Landing from './Components/Landing'
import Nav from './Components/Nav'
import BottomBlur from './Components/BottomBlur'

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,      // higher = longer glide
      smoothWheel: true,
      touchMultiplier: 1.6,
    })

    let frame
    const raf = (time) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <Nav />
      <Landing />
      <AboutSection />
      <Footer />
      <BottomBlur />
    </>
  )
}

export default App