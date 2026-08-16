import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { SettingsProvider } from "./context/SettingsContext";
import { HydroSourceProvider } from "./context/HydroSourceContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SettingsProvider>
      <HydroSourceProvider>
        <App />
      </HydroSourceProvider>
    </SettingsProvider>
  </React.StrictMode>,
);
