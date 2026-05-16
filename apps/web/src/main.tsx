import { createBrowserHistory, createHashHistory, RouterProvider } from "@tanstack/react-router";
import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import { IS_DESKTOP } from "./env";
import { getRouter } from "./router";

const history = IS_DESKTOP ? createHashHistory() : createBrowserHistory();
const router = getRouter(history);

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
