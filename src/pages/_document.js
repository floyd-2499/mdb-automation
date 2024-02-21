import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon2.ico" sizes="any" />
        {/* <script async src="https://cdn.zingchart.com/zingchart.min.js"></script> */}
        <script src="https://cdn.zingchart.com/zingchart.min.js"></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
