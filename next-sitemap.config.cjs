/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL,
    generateIndexSitemap: false, // (optional)
    generateRobotsTxt: true, // (optional)
    // ...other options
}