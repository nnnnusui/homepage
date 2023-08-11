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

import { useKeys } from "@/fn/state/root/keys";

export default function Root() {
  const [,,keyEvent] = useKeys;

  return (
    <Html lang="en">
      <Head>
        <_Head />
      </Head>
      <Body
        onKeyDown={keyEvent.onKeyDown}
        onKeyUp={keyEvent.onKeyUp}
      >
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
