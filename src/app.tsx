import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

import "./app.css";
import "./app.styl";
import { _Head } from "./_Head";

export default function App() {
  return (
    <MetaProvider>
      <Router
        root={(props) => (
          <>
            <_Head />
            <Suspense>{props.children}</Suspense>
          </>
        )}
      >
        <FileRoutes />
      </Router>
    </MetaProvider>
  );
}
