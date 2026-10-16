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

- If you move to a custom domain, replace `https://priyashakhurana.github.io/tdt-reformedwebsite/` in `index.html`, `robots.txt`, `sitemap.xml` and `llms.txt`.
- Connect the audit form in `assets/main.js` to your inbox or CRM.
