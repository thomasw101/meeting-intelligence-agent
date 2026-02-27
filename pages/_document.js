import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/LLS_L_Only_Colour.png" type="image/png" />
        <link rel="apple-touch-icon" href="/LLS_L_Only_Colour.png" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}