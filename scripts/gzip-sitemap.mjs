import fs from 'fs';
import zlib from 'zlib';

const sitemapPath = '../public/sitemap.xml';
const gzPath = '../public/sitemap.xml.gz';

const xml = fs.readFileSync(sitemapPath);
const gzipped = zlib.gzipSync(xml);

fs.writeFileSync(gzPath, gzipped);