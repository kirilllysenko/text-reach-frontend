// @refresh reload
import { render } from "@solidjs/web";
import "text-reach-frontend-library/styles.css";
import App from "./app";

const appElement = document.getElementById("app");

if (!appElement) {
  throw new Error("Application root was not found.");
}

render(() => <App />, appElement);
