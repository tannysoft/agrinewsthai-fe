<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  exclude-result-prefixes="sitemap image">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <title>XML Sitemap</title>
        <style>
          body { font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #222; margin: 0; padding: 24px 32px; background: #fafafa; }
          h1 { font-size: 20px; margin: 0 0 4px; }
          p.meta { color: #666; margin: 0 0 24px; }
          table { border-collapse: collapse; width: 100%; background: #fff; border: 1px solid #e5e5e5; }
          th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #eee; font-size: 13px; }
          th { background: #f3f3f3; font-weight: 600; }
          tr:last-child td { border-bottom: 0; }
          tr:hover td { background: #fafbff; }
          a { color: #2a5bd7; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .count { color: #888; font-weight: normal; margin-left: 6px; }
        </style>
      </head>
      <body>
        <xsl:choose>
          <xsl:when test="sitemap:sitemapindex">
            <h1>XML Sitemap Index
              <span class="count">
                <xsl:text>(</xsl:text>
                <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/>
                <xsl:text> sitemaps)</xsl:text>
              </span>
            </h1>
            <p class="meta">This is a sitemap index generated for search engines.</p>
            <table>
              <thead>
                <tr><th>Sitemap</th><th>Last Modified</th></tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                  <tr>
                    <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                    <td><xsl:value-of select="sitemap:lastmod"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:when>
          <xsl:otherwise>
            <h1>XML Sitemap
              <span class="count">
                <xsl:text>(</xsl:text>
                <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/>
                <xsl:text> URLs)</xsl:text>
              </span>
            </h1>
            <p class="meta">This is a sitemap generated for search engines.</p>
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Images</th>
                  <th>Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                    <td><xsl:value-of select="count(image:image)"/></td>
                    <td><xsl:value-of select="sitemap:lastmod"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:otherwise>
        </xsl:choose>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
