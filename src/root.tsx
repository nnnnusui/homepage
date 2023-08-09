// @refresh reload
import { Suspense } from "solid-js";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Routes,
  Scripts,
} from "solid-start";

import "./root.styl";
import _Head from "./_Head";

export default function Root() {

  return (
    <Html lang="en">
      <Head>
        <_Head />
      </Head>
      <Body>
        <Suspense>
          <ErrorBoundary>
            {/* <A href="/">Index</A> */}
            {/* <A href="/about">About</A> */}
            <Routes>
              <FileRoutes />
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
