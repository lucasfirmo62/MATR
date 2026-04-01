import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./Pages/Home/index"
import NewPresentation from "./Pages/NewPresentation/index"
import Presentation from "./Pages/Presentation"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new-presentation" element={<NewPresentation />} />
        <Route path="/presentation" element={<Presentation />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App