

# Aureum House: Agent Instructions: Feature Specification

Status: Product proposal for development.

## 1. Product purpose

Build a CMS for a media company that uses AI to collect reference material, identify entities, connect developments within a story, and produce articles for publication.

Source articles live in Archive. Articles produced by the media company live in Editorial. Every published article should retain a traceable link to the reference material used to create it.

The product contains 13 modules. The first release requires human review before publication.

## 2. Core workflow

1. An editor registers an RSS feed, website or API in Ingest.
2. The scheduler fetches each source at its configured interval, or an editor starts a run manually.
3. The system extracts content and metadata, checks for duplicates, and stores the source article.
4. Background jobs create embeddings, extract entities, and suggest topics.
5. Archive provides search and access to all source articles.
6. Topic groups articles into stories and events on a timeline.
7. Newsroom suggests stories or angles to produce.
8. Editorial creates a draft from selected sources.
9. Claims helps the editor check claims, references and conflicts.
10. An editor approves the article for immediate or scheduled publication.
11. Distribution creates versions for other channels.
12. Analytics records performance, while Corrections manages changes after publication.

## 3. Modules and features

### 3.1 Ingest

Manage sources and fetch articles on a schedule.

- Create, read, update and delete sources.
- Support RSS feeds, website URLs and API URLs.
- Store source name, URL, type, publisher/brand, language, active state and pause state.
- Configure a fetch interval per source.
- Support API authentication, headers, pagination and response-field mapping.
- Support extraction rules for websites with unusual page structures.
- Provide run now, pause, resume and retry actions.
- Store original content and cleaned article text.
- Store available metadata: title, original URL, canonical URL, author, publisher, publication date, update date, fetch time, language, category, tags and original images.
- Preserve missing fields as empty. The system must not invent metadata.
- Deduplicate by source identifier, URL and content before creating an article.
- Store revisions when the same source article changes.
- Run embedding, entity extraction and topic suggestions as background jobs after storage.
- Keep an article available when an AI step fails and allow that step to be retried.
- Show last run, next run and source status.
- Log new, updated, duplicate and failed articles for every run.
- Prevent overlapping runs and duplicate articles when a job is retried.
- Apply bounded retries and actionable error messages.

### 3.2 Entity

Build a directory of entities found in articles.

- Initial categories: people, organizations, books, political parties, places and events.
- Store canonical name, aliases, category, description, image and source references.
- Link each article to its entities and retain the text context where the entity appears.
- Let AI suggest new entities or matches to existing entities.
- Store match confidence and review status.
- Let editors create, edit, merge, split and remove entity links.
- Store abbreviations, titles and spelling variants as aliases.
- Show related articles, topics and events on each entity page.
- Store original images, source/credit, crop version and crop coordinates.
- Let AI suggest an image and crop, while allowing the editor to choose and adjust it.
- Use face detection to assist cropping people, but do not treat it as identity verification.
- Do not automatically set an unverified image as the primary entity image.

### 3.3 Archive

Serve as the library for fetched source articles.

- List articles with title, publisher, date, tags and processing status.
- Support keyword and semantic search using embeddings.
- Filter by source, date, entity, topic, language, tag and status.
- Show full article content with metadata, original URL, related entities and topics.
- Let editors correct metadata, tags and entity/topic links without overwriting the original source copy.
- Show related articles and group coverage of the same event.
- Keep attribution for every publisher when several articles cover the same event.
- Show revisions when a source article changes.
- Use processing states: pending, processing, ready and failed.
- Let editors select source articles as material for an Editorial draft.

### 3.4 Topic

Connect articles to stories that develop over time.

- Create, edit, archive and merge topics.
- Store topic name, description, main entities, related articles and timeline.
- Let AI suggest article-to-topic links and let editors accept, add or remove them.
- Support parent topics and subtopics.
- Represent one event once in the timeline even when many articles report it.
- Store event title, summary, event date, sources and related entities.
- Keep event date separate from article publication date.
- Label unknown or approximate dates clearly.
- Let editors reorder timeline events, merge duplicates and split incorrectly grouped events.
- Provide background and latest-development summaries with links to sources.

### 3.5 Settings

Manage AI connections and CMS configuration.

- Configure AI providers, API keys, models and local LLM endpoints.
- Select separate models for embeddings, extraction, writing and image tasks.
- Provide connection tests and model capability checks.
- Configure default language, editorial timezone, writing style and AI-use labels.
- Set AI usage limits and show usage or estimated cost when provider data is available.
- Store keys securely on the server, mask them in the UI and exclude them from logs.
- Record the embedding model used by each vector and provide a re-embedding path when the model changes.
- Manage users and roles. Initial roles: admin, editor and reviewer.

### 3.6 Newsroom / Story Leads

Turn incoming material into story ideas for the media company.

- Suggest stories based on new developments, increased coverage and related archive material.
- Store suggested title, angle, reason for relevance, supporting sources and related topics/entities.
- Show whether the media company has already published a similar story.
- Let editors create leads manually, accept them, dismiss them or assign them.
- Convert an accepted lead into an Editorial draft with its supporting sources.
- Use lead states: new, accepted, dismissed and converted to draft.

### 3.7 Editorial / Studio

Write, review and publish the media company’s own articles.

- Create a draft manually, from a Story Lead or from selected articles/topics.
- Generate a draft from editor-selected sources.
- Choose angle, language, length and format, such as brief news, explainer, profile or recap.
- Edit title, standfirst, body, cover image, caption, credit, tags and slug.
- Keep source links and supporting excerpts used by the draft.
- Let editors accept or reject AI suggestions without silently overwriting manual edits.
- Store revision history with editor and timestamp.
- Use states: draft, in review, approved, scheduled, published and unpublished.
- Let reviewers comment and return an article for revision.
- Support immediate and scheduled publication using the editorial timezone.
- Require another review when approved content changes before publication.
- Provide a public article view with permanent URL, publication/update date, attribution, references and AI-use label.
- Provide a preview before publication and preserve the published version for rollback and correction tracking.

### 3.8 Claims / Fact Check

Help editors check factual claims in drafts.

- Extract factual claims and link each claim to supporting excerpts and sources.
- Flag claims without sources, inconsistent numbers/dates and conflicts between sources.
- Distinguish reported information, a person’s quote and an inference made in the draft.
- Use review states: unchecked, supported, conflicting, unsupported and editor-verified.
- Treat supported as evidence found, not as proof that a claim is true.
- Do not count multiple articles copying the same source as independent confirmation.
- Let editors add sources, revise claims and record review decisions.
- Mark related checks for review again when a claim changes.
- Keep final approval with the editor.

### 3.9 Media Library

Manage visual assets for entities, articles and distribution.

- Upload and manage original images, entity crops, AI illustrations and article covers.
- Store filename, type, dimensions, source, credit, usage information and alt text.
- Distinguish external assets, uploaded assets and AI-generated assets.
- Store the prompt and provider/model for AI assets when available.
- Create manual crops and size variants for articles and social channels.
- Show which articles and entities use each asset.
- Prevent deletion of an in-use asset without an explicit replacement or removal action.

### 3.10 Editorial Calendar / Assignments

Plan editorial work and publication.

- Provide calendar and list views for leads, assignments, drafts and scheduled articles.
- Assign writers, editors and reviewers with deadlines.
- Record upcoming events for planning.
- Show work status, owner and overdue items.
- Link assignments to leads, topics or articles.
- Keep scheduled article changes synchronized with the publication record.

### 3.11 Distribution

Adapt completed articles for other publishing channels.

- Generate social captions, carousel copy, newsletter copy and short-video scripts.
- Store a separate version and state for each channel.
- Let editors review and edit every channel version.
- Include a link back to the original article where appropriate.
- Start with copy/export. Direct publishing requires a supported channel integration.
- For connected channels, support scheduling, publication results and failure retry.
- Prevent duplicate posts when a publishing request is repeated.
- Flag affected channel versions when the source article is corrected.

### 3.12 Audience / Analytics

Measure content performance and reader interest.

- Show views, traffic sources, reading engagement and returning readers when measured by the available analytics system.
- Compare performance by article, topic, entity, period and channel.
- Show articles that lead readers to related content.
- Record conversions such as newsletter subscriptions when available.
- Use performance data to suggest follow-up ideas in Newsroom.
- Distinguish measured data from estimates and show unavailable metrics as no data.

### 3.13 Corrections / Updates

Manage corrections and developments after publication.

- Let editors open a correction record manually.
- When a source revision is detected, find published and draft articles that depend on it.
- Flag potentially affected articles for editor review.
- Store before/after versions, correction reason, supporting source, editor and timestamp.
- Distinguish factual corrections from new developments.
- Support a public correction note and updated date.
- Link corrections to claims and affected distribution versions.
- Do not rewrite a published article automatically when its source changes.

## 4. Core records and relationships

- **Publisher/Brand:** Original publisher identity. One publisher can have multiple sources.
- **Source:** RSS, website or API with fetch configuration and schedule.
- **Ingest Run:** One execution of a source fetch and its results.
- **Source Article + Revision:** Original/cleaned content, metadata and change history.
- **Embedding:** Search representation with its model and source revision.
- **Entity + Mention:** Entity identity and article context where it appears.
- **Topic + Event:** Story and timeline event supported by source articles.
- **Story Lead:** Suggested angle with supporting material.
- **Editorial Article + Revision:** Media-owned content, edit history and published versions.
- **Claim + Evidence:** Claim, supporting excerpt, source and review decision.
- **Media Asset:** Original asset, crop/size variants, attribution and usage history.
- **Assignment:** Owner, deadline and linked editorial work.
- **Distribution Item:** Channel version, target channel and publication result.
- **Correction:** Change reason and affected article, claim or distribution version.

Article-to-entity, article-to-topic and event-to-source links are many-to-many. Evidence links must point to the source revision used so later source changes do not erase the original context.

## 5. Cross-module requirements

### Reliability

- Run fetching and AI processing as inspectable background jobs.
- Retries must not create duplicates or remove user edits.
- Store provider/model and timestamp for every AI result.
- A failed source must not stop other sources.
- Provide backup and recovery before production use.

### Security and access

- Require authentication for the CMS; restrict Settings and publication actions by role.
- Validate ingest URLs, including redirects, to prevent access to internal or sensitive endpoints.
- Keep approved local LLM endpoints separate from ingest URLs.
- Limit fetch time, response size, upload size and accepted file types.
- Sanitize source HTML before displaying it in the CMS.
- Treat external content as reference data, never as instructions to the AI or system.
- Log credential changes, entity merges, approvals, publications and corrections.

### Usability

- Every list needs clear loading, empty and error states.
- Primary actions must work with a keyboard and have understandable labels.
- Store dates consistently and display them in the editorial timezone.
- Clearly distinguish AI suggestions from editor-verified decisions.

## 6. Development priorities

### Phase 1: Collection and basic publishing

Settings, Ingest, Archive, Entity, Topic, Editorial, Claims, Media Library and basic Corrections.

Result: an editor can fetch, search, connect, draft, fact-check and publish an article with traceable references.

### Phase 2: Editorial operations

Newsroom, Story Leads, Editorial Calendar, assignments, scheduled publishing, richer claim conflict checks, improved entity/topic review, Distribution copy/export and source-impact flags.

### Phase 3: Distribution and audience feedback

Direct channel integrations, measured Analytics, performance-based Newsroom suggestions, more source connectors and provider-specific processing controls.

## 7. Acceptance criteria

- Editors can add, schedule, run and pause sources without losing existing articles.
- Repeated fetches do not create duplicates; changed source content creates a revision.
- Articles remain available when embedding or extraction fails, with a retry option.
- Editors can correct entities, images, tags and topic suggestions.
- Multiple articles about one event can share one timeline event while retaining every source attribution.
- Drafts link to the exact source articles and revisions used.
- Unsupported or conflicting claims can be identified and reviewed before approval.
- Only approved versions can publish, and scheduled publishing does not create duplicates.
- Corrections preserve version history and can be shown to readers.
- API keys do not appear in normal views, public responses or logs.

## 8. Decisions still required

- Media name, target readers, primary language and editorial guidelines.
- Initial sources and the actual RSS, website and API formats they use.
- Initial AI providers/models and operating cost limit.
- Whether the public website is built with the CMS or connected to an existing publishing system.
- First distribution channels and analytics method.
- Source-content retention, user-access and data-retention policies.

This document defines the feature scope. Technology, deployment and UI decisions can be made during implementation.
