import React, { ReactElement } from "react";
import type { AppProps } from "next/app";
import "../styles/globals.scss";

const App = ({ Component, pageProps }: AppProps): ReactElement => {
  return <Component {...pageProps} />;
};

export default App;
