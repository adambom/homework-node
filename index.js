'use strict';


require('babel-register');
require('babel-polyfill');

const path = require('path');

const Downloader = require('./src/downloader').default;
const Parser = require('./src/parser').default;


const BASE_URL = 'https://www.npmjs.com/browse/depended';
const DOWNLOAD_PATH = path.resolve(__dirname, './packages');
const SELECTOR = '.package-widget .package-details .name';

const parser = new Parser(SELECTOR);
const downloader = new Downloader(BASE_URL, DOWNLOAD_PATH, parser);


module.exports = downloader.download;
