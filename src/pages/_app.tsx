import React, { ReactElement } from "react";
import type { AppProps } from "next/app";
import "../styles/globals.scss";
import Head from "next/head";

const App = ({ Component, pageProps }: AppProps): ReactElement => {
  return (
    <>
      <Head>
        <title>home - nnnnusui.ga</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default App;
