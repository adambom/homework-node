import path from 'path';

import request from 'request-promise';
import downloadTarball from 'download-tarball';

import { asyncForEach } from './util';


export default class Downloader {
  constructor(url, outputPath, parser) {
    this._url = url;
    this._outputPath = outputPath;
    this._parser = parser;
  }


  download = async (count, callback) => {
    try {
      var html = await this._downloadHTML();
    } catch (e) {
      return callback(e);
    }

    const packageNames = this._getPackageNamesFromHTML(html, count);

    try {
      await asyncForEach(packageNames, this._downloadPackage);
    } catch (e) {
      return callback(e);
    }

    callback();
  }


  async _downloadHTML() {
    return request.get(this._url);
  }


  _getPackageNamesFromHTML(html, count) {
    return this._parser.parse(html, count);
  }


  _downloadPackage = async (packageName) => {
    const tarballURL = await this._getTarballURL(packageName);

    await downloadTarball({
      url: tarballURL,
      dir: path.join(this._outputPath, packageName),
      extractOpts: {
        map: (header) => ({
          ...header,
          name: path.relative('package/', header.name),
        }),
      },
    });
  }


  async _getTarballURL(packageName, version='latest') {
    const packageMetadata = await request.get({
      url: `https://registry.npmjs.org/${packageName}/${version}`,
      json: true,
    });

    return packageMetadata.dist.tarball;
  }

}
