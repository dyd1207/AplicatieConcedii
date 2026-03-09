import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/theme.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />

        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
          }}
        />

      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);