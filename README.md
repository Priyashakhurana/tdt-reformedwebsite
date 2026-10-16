# The Drip Theory

Website for The Drip Theory, a Reddit × LinkedIn marketing agency for B2B SaaS.

Static site: no build step. Open `index.html` or serve the folder.

```
python3 -m http.server 8080
```

## Structure

- `index.html`: page content, meta tags and structured data
- `assets/styles.css`, `assets/main.js`: styles and interactions
- `robots.txt`, `sitemap.xml`, `llms.txt`: crawler and search files

## Before launch

- Domain: www.thedriptheory.com (set in `CNAME`).
- The audit form opens an email to coffee@thedriptheory.com. Swap in a form service or CRM in `assets/main.js` if needed.
