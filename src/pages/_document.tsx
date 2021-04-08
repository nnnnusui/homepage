/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from "react";
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";

export default class extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    return await Document.getInitialProps(ctx);
  }

  render() {
    return (
      <Html lang="en">
        <Head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# website: http://ogp.me/ns/website#">
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:site" content="@nnnnusui" />
          <meta name="twitter:creator" content="@nnnnusui" />
          <meta property="fb:app_id" content="198922981704616" />

          <meta property="og:url" content="https://nnnnusui.ga" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="home - nnnnusui.ga" />
          <meta property="og:description" content="In production..." />
          <meta
            property="og:image"
            content="https://nnnnusui.ga/thumbnail.png"
          />
          <meta property="og:site_name" content="nnnnusui.ga" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
