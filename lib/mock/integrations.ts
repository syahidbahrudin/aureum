export type IntegrationStep = {
  title: string;
  detail: string;
  /** Empty until a real, tested snippet exists. */
  code: string;
};

export type Integration = {
  slug: string;
  name: string;
  summary: string;
  docsUrl: string;
  steps: IntegrationStep[];
};

export const mockIntegrations: Integration[] = [
  {
    slug: "wordpress",
    name: "WordPress",
    summary:
      "Publish an approved article to WordPress over the REST API using an application password.",
    docsUrl: "https://developer.wordpress.org/rest-api/",
    steps: [
      {
        title: "Create an application password",
        detail:
          "In the WordPress user profile, generate an application password. Store it as a secret; it authenticates REST requests without the account login password.",
        code: "",
      },
      {
        title: "Create the post",
        detail:
          "Send the title, HTML content, and status to the posts endpoint. Keep status as draft or pending so an editor confirms before it goes live.",
        code: "",
      },
      {
        title: "Attach the featured image",
        detail:
          "Upload the image to the media endpoint, then set the returned media id as the post's featured image.",
        code: "",
      },
    ],
  },
  {
    slug: "drupal",
    name: "Drupal",
    summary:
      "Create a content node in Drupal through the JSON:API module.",
    docsUrl: "https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module",
    steps: [
      {
        title: "Enable JSON:API",
        detail:
          "Turn on the core JSON:API module and confirm the article content type is exposed. Restrict write access to an authenticated role.",
        code: "",
      },
      {
        title: "Authenticate the request",
        detail:
          "Use a configured auth method (such as an OAuth token) for the account allowed to create article nodes.",
        code: "",
      },
      {
        title: "Create the node",
        detail:
          "POST a JSON:API resource object for the article type with the title and body fields. Leave it unpublished for editor review.",
        code: "",
      },
    ],
  },
  {
    slug: "strapi",
    name: "Strapi",
    summary:
      "Create an entry in a Strapi collection type with the content API.",
    docsUrl: "https://docs.strapi.io/dev-docs/api/rest",
    steps: [
      {
        title: "Create an API token",
        detail:
          "In Settings, generate an API token scoped to create on the article collection type. Store it as a secret.",
        code: "",
      },
      {
        title: "Create the entry",
        detail:
          "POST the article fields to the collection endpoint with the token in the Authorization header. Keep it as a draft.",
        code: "",
      },
      {
        title: "Upload media",
        detail:
          "Upload the image through the upload endpoint, then relate the returned file to the entry's media field.",
        code: "",
      },
    ],
  },
  {
    slug: "payload",
    name: "Payload",
    summary:
      "Create a document in a Payload collection through its REST API.",
    docsUrl: "https://payloadcms.com/docs/rest-api/overview",
    steps: [
      {
        title: "Create an API key",
        detail:
          "Enable API keys on the user collection and issue one for a service account with create access to the articles collection.",
        code: "",
      },
      {
        title: "Create the document",
        detail:
          "POST the article fields to the collection endpoint with the API key. Set the status field so an editor publishes it.",
        code: "",
      },
      {
        title: "Upload media",
        detail:
          "Upload the image to the media collection, then reference the returned document id on the article's image field.",
        code: "",
      },
    ],
  },
];

export function findIntegration(slug: string): Integration | undefined {
  return mockIntegrations.find((integration) => integration.slug === slug);
}
