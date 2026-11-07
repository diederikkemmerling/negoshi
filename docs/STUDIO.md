# Negoshi Studio

Contributor backend at `/studio`.

- First visit to `/studio` creates the editor account (only works once).
- Editor invites contributors under Team; each gets a personal link and sets their own password.
- Authors write, upload images and send articles to the editor. The editor publishes, returns with a note, or takes articles offline.
- Published articles appear on `/{lang}/analysis`, with author pages at `/{lang}/analysis/author/{slug}`.

Storage: Vercel Blob (`BLOB_READ_WRITE_TOKEN`, added automatically when a Blob store is connected to the project). Without it, production shows a "not ready" page.
