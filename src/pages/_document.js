import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    // Generate current date in YYYY/MM/DD format for Google Scholar
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}/${month}/${day}`;

    return (
      <Html lang="en">
        <Head>
          {/* Bibliographic meta-tags for Google Scholar */}
          <meta name="citation_title" content="Yourself To Science" />
          <meta name="citation_author" content="Mario Marcolongo" />
          <meta name="citation_publication_date" content={formattedDate} />
          <meta name="citation_fulltext_world_readable" content=" " /> {/* Add this line */}
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