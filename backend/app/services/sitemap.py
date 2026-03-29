from fastapi import APIRouter
from fastapi.responses import XMLResponse

router = APIRouter()

SITEMAP_TEMPLATE = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{urls}
</urlset>"""

URL_TEMPLATE = """<url>
<loc>{loc}</loc>
<lastmod>{lastmod}</lastmod>
<changefreq>{changefreq}</changefreq>
<priority>{priority}</priority>
</url>"""

PAGES = [
    {
        "loc": "https://vibetrack.app/",
        "lastmod": "2026-03-30",
        "changefreq": "daily",
        "priority": "1.0",
    },
    {
        "loc": "https://vibetrack.app/dashboard",
        "lastmod": "2026-03-30",
        "changefreq": "daily",
        "priority": "0.9",
    },
    {
        "loc": "https://vibetrack.app/insights",
        "lastmod": "2026-03-30",
        "changefreq": "weekly",
        "priority": "0.8",
    },
    {
        "loc": "https://vibetrack.app/settings",
        "lastmod": "2026-03-30",
        "changefreq": "monthly",
        "priority": "0.6",
    },
]


@router.get("/sitemap.xml", response_class=XMLResponse)
def generate_sitemap():
    urls = ""
    for page in PAGES:
        urls += URL_TEMPLATE.format(**page)

    sitemap = SITEMAP_TEMPLATE.format(urls=urls)
    return XMLResponse(content=sitemap, media_type="application/xml")


@router.get("/robots.txt")
def generate_robots():
    return """User-agent: *
Allow: /

Sitemap: https://vibetrack.app/sitemap.xml"""
