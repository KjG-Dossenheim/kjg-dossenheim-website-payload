/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://example.com',
    generateIndexSitemap: false, // (optional)
    generateRobotsTxt: true, // (optional)
    // ...other options
}