import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { PythonProvider } from "react-py";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PythonProvider>
      <App />
    </PythonProvider>
  </React.StrictMode>
);
