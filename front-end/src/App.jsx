import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./Pages/Home/index"
import NewPresentation from "./Pages/NewPresentation/index"
import Presentation from "./Pages/Presentation"
import TrainingMode from "./Pages/Training"
import TrainingContinue from "./Pages/TrainingContinue" // IMPORTANTE: Criar este arquivo depois

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new-presentation" element={<NewPresentation />} />
        <Route path="/presentation" element={<Presentation />} />
        <Route path="/training" element={<TrainingMode />} />
        {/* NOVA ROTA DINÂMICA */}
        <Route path="/treino/:id" element={<TrainingContinue />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App