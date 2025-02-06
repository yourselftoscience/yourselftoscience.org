import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Bibliographic meta-tags for Google Scholar */}
          <meta name="citation_title" content="Yourself To Science" />
          <meta name="citation_author" content="Your Organization" />
          <meta name="citation_publication_date" content="2023/10/20" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          {/* Inline script with proper semicolon termination */}
          <script
            dangerouslySetInnerHTML={{
              __html: 'console.log("Page loaded");',
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;