import { useEffect } from "react";

interface MetaTagsProps {
  title: string;
  description: string;
  keywords?: string;
  author?: string;
  ogImageUrl?: string;
  ogUrl?: string;
  twitterImageUrl?: string;
}

const MetaTags: React.FC<MetaTagsProps> = ({
  title,
  description,
  keywords,
  author,
  ogImageUrl,
  ogUrl,
  twitterImageUrl,
}) => {
  useEffect(() => {
    // Set the document title (important for SEO and user experience)
    document.title = title;

    // Helper function to update or create meta tags
    const setMetaTag = (name: string, content: string, property?: boolean) => {
      const attributeName = property ? "property" : "name";
      let metaElement = document.querySelector(
        `meta[${attributeName}="${name}"]`
      );
      if (!metaElement) {
        metaElement = document.createElement("meta");
        metaElement.setAttribute(attributeName, name);
        document.head.appendChild(metaElement);
      }
      metaElement.setAttribute("content", content);
    };

    // Helper function to update or create link tags
    const setLinkTag = (
      rel: string,
      href: string,
      extraAttributes: Record<string, string> = {}
    ) => {
      let linkElement = document.querySelector(`link[rel="${rel}"]`);
      if (!linkElement) {
        linkElement = document.createElement("link");
        linkElement.setAttribute("rel", rel);
        document.head.appendChild(linkElement);
      }
      linkElement.setAttribute("href", href);
      Object.entries(extraAttributes).forEach(([key, value]) => {
        linkElement.setAttribute(key, value);
      });
    };

    // Canonical Link Tag
    // Helps prevent duplicate content issues by specifying the preferred URL of a page.
    setLinkTag("canonical", "REPLACEME");

    // Hreflang Link Tag (example for English US)
    // Helps search engines serve the correct language or regional URL in search results.
    setLinkTag("alternate", "REPLACEME", { hreflang: "en-us" });

    // Structured Data using JSON-LD
    // Provides search engines with context about your site, potentially leading to rich search results.
    const structuredDataScriptId = "structured-data-jsonld";
    let scriptElement = document.getElementById(structuredDataScriptId);
    if (!scriptElement) {
      scriptElement = document.createElement("script");
      scriptElement.id = structuredDataScriptId;
      scriptElement.setAttribute("type", "application/ld+json");
      document.head.appendChild(scriptElement);
    }
    scriptElement.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      url: "REPLACEME",
      name: "REPLACEME",
      potentialAction: {
        "@type": "SearchAction",
        target: "REPLACEME?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    });

    // Standard Meta Tags
    // Description tag: Provides a summary of your page for search engine results.
    setMetaTag("description", description);
    // Keywords tag: Although less important nowadays, it can still be used for internal relevance.
    if (keywords) setMetaTag("keywords", keywords);
    // Author tag: Gives credit to the content creator.
    if (author) setMetaTag("author", author);

    // Open Graph Meta Tags for Social Sharing
    // These tags improve how your pages are displayed when shared on social media.
    setMetaTag("og:title", title, true);
    setMetaTag("og:type", "website", true);
    setMetaTag("og:description", description, true);
    if (ogUrl) setMetaTag("og:url", ogUrl, true);
    if (ogImageUrl) setMetaTag("og:image", ogImageUrl, true);

    // Twitter Meta Tags for Social Sharing
    // Optimize the way your page appears when shared on Twitter.
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:site", "@REPLACEME");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    if (twitterImageUrl) setMetaTag("twitter:image", twitterImageUrl);

    // Robots Meta Tag
    // Instructs search engine crawlers how to index the page.
    setMetaTag("robots", "index, follow");

    // Cleanup (optional): Add any cleanup logic here if necessary.
    return () => {
      // For instance, you might want to remove or reset tags on unmount.
    };
  }, [
    title,
    description,
    keywords,
    author,
    ogImageUrl,
    ogUrl,
    twitterImageUrl,
  ]);

  // This component doesn't render any visible content
  return null;
};

export default MetaTags;
