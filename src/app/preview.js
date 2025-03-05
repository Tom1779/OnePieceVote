import Head from "next/head";

export function Preview({ link, title, imageUrl }) {
  return (
    <Head>
      <meta name="og:type" content="website" />
      <meta name="og:url" content={link} />
      <meta name="og:title" content={title} />
      <meta
        name="og:description"
        content="Vote for your favorite one piece characters"
      />
      <meta name="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={link} />
      <meta name="twitter:title" content={title} />
      <meta
        name="twitter:description"
        content="Vote for your favorite one piece characters"
      />
      <meta name="twitter:image" content={imageUrl} />
    </Head>
  );
}
