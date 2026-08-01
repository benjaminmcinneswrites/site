# Better Site workspace instructions

## Client mockup prompts

When the user asks to create, design, build, or revise a mockup for a prospective client:

1. For a new client mockup, run `npm run mockup:new -- "Client or business name"` before creating the design. Do not choose or reuse an ID manually.
2. Build the entire mockup inside the newly reported `mockup/<business-name>-<12-digit-id>/` directory. Keep its assets self-contained in that directory unless the user explicitly asks to share an existing site asset.
3. Preserve `<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">` and `<meta name="referrer" content="no-referrer">` in every HTML page in the mockup.
4. Do not add mockup URLs to public navigation, `sitemap.xml`, public portfolio pages, crawler/AI text files, or any publicly served index/manifest.
5. At handoff, give the user the production URL printed by the creation command so it can be pasted into a DM or cold email.
6. For revisions, use the existing named mockup directory identified by the user; do not generate a new URL unless they ask for a separate version.

The local-only dashboard is at `http://127.0.0.1:8000/mockups/` after running `node local-server.js 8000`.
