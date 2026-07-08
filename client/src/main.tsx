import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'Inter', sans-serif",
            fontSize: "13.5px",
            color: "#0F172A",
            border: "1px solid #E2E8F0",
            borderRadius: "9px",
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
