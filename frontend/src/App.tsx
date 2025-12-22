import { Routes, Route } from "react-router-dom";
import { ChatLayout } from "./components/ChatLayout";
import "./index.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatLayout />} />
      <Route path="/chat/:conversationId" element={<ChatLayout />} />
    </Routes>
  );
}

export default App;
