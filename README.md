# RAMAD Construction legacy website

This static GitHub Pages site is an older RAMAD presentation. The current canonical website is:

`https://ramad-construction-real-estate.vercel.app/`

To prevent duplicate search results, this legacy URL uses a canonical link to the current website, a `noindex` directive, and a blocking `robots.txt`. It must not be submitted as a separate Google Search Console property or sitemap.

The stock gallery is labelled as architectural inspiration rather than completed work, unverified testimonials have been removed, and the contact form clearly states that it does not transmit data. The owner must verify company credentials, project history, statistics, phone, email, address, and social profiles before presenting them as current facts.

## Local preview

Serve the repository through a local HTTP server so relative assets load consistently.

```bash
# macOS or Linux
python3 -m http.server 8000

# Windows
py -m http.server 8000
```

Then open `http://localhost:8000` in a browser. Stop the server with `Ctrl+C`.

No dependency installation or build step is required.
