import { createRouter } from "@solidjs/router";
import { fileRoutes } from "@solidjs/router/fs";
import { pageRoutes } from "virtual:file-routes";
import RootLayout from "./routes/+layout";
import "./app.css";

const AppRouter = createRouter({ routes: fileRoutes(pageRoutes) });

export default function App() {
  return <AppRouter>{(props) => <RootLayout>{props.children}</RootLayout>}</AppRouter>;
}
