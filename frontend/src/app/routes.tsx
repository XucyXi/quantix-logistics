import { createBrowserRouter, redirect } from "react-router";
import { LandingPage } from "./pages/LandingPage";

// Varareititys: kaikki tuntemattomat polut ohjataan etusivulle.
export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "*",
    loader: () => redirect("/"),
  },
]);