import Head from "next/head";

export function Preview({ link, title, imageUrl }) {
  return (
    <Head>
      <meta property="og:type" content="website" />
      <meta property="og:url" content={link} />
      <meta property="og:title" content={title} />
      <meta
        property="og:description"
        content="Vote for your favorite one piece characters"
      />
      <meta property="og:image" content={imageUrl} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={link} />
      <meta property="twitter:title" content={title} />
      <meta
        property="twitter:description"
        content="Vote for your favorite one piece characters"
      />
      <meta property="twitter:image" content={imageUrl} />
    </Head>
  );
}
