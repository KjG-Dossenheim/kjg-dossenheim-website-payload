/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL,
    generateIndexSitemap: false, // (optional)
    generateRobotsTxt: true, // (optional)
    exclude: ['/server-sitemap.xml'], // <= exclude here
    robotsTxtOptions: {
        additionalSitemaps: [
            `${process.env.SITE_URL}/server-sitemap.xml`, // <==== Add here
        ],
    },
}