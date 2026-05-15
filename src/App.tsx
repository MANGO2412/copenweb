import {Routes,Route} from "react-router"
import Login from "@/pages/Login"
import Home from "@/pages/Home"
import { Toaster } from "@/components/ui/sonner"
import CheckAUth from "./components/CheckAuth"

function App() {
  return (
    <>
    <Routes>
      <Route path="/login" element={<CheckAUth><Login /></CheckAUth>} />
      <Route path="/" element={<CheckAUth><Home /></CheckAUth>} />
    </Routes>
    <Toaster/>
    </>
  )
}

export default App
