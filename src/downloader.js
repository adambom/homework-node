import assert from 'assert';
import path from 'path';

import downloadTarball from 'download-tarball';
import request from 'request-promise';

import {
  asyncForEach,
  iterator,
} from './util';


export default class Downloader {
  constructor(url, outputPath, parser, batchSize=100) {
    this._url = url;
    this._outputPath = outputPath;
    this._parser = parser;
    this._batchSize = batchSize;
  }


  download = async (count, callback) => {
    try {
      await this._downloadInBatches(count);
    } catch (e) {
      return callback(e);
    }

    callback();
  }


  async _downloadInBatches(count) {
    let progress = 1;

    for await (let batchOfNames of this._getPackageNamesInBatches(count)) {
      this._logProgress(progress, batchOfNames.length, count);

      await this._downloadBatch(batchOfNames);

      progress += batchOfNames.length;
    }
  }


  _getPackageNamesInBatches = async function* (count) {
    const batchSize = Math.min(count, this._batchSize);

    assert.ok(batchSize > 0, `Expected batch size to be greater than 0, got: ${batchSize}`);

    let remaining = count;
    let batch = [];

    for await (let page of this._readAllPages(count)) {
      for (let pkg of iterator(page)) {
        if (remaining === 0) {
          yield batch;
          return;
        }

        batch.push(pkg);

        if (batch.length === batchSize) {
          yield batch;
          batch = [];
        }

        remaining -= 1;
      }
    }
  }


  _readAllPages = async function* () {
    let offset = 0;

    while (true) {
      const html = await this._downloadHTML(this._makeUrlForOffset(offset));

      const names = this._getPackageNamesFromHTML(html);

      // Scoped packages throw status 401 when downloading metadata
      yield names.filter(this._isNotScopedPackageName);

      offset += names.length;
    }
  }


  _isNotScopedPackageName = name => !/@/.test(name);


  _makeUrlForOffset(offset) {
    return `${this._url}?offset=${offset}`;
  }


  async _downloadHTML(url) {
    return request.get(url);
  }


  _logProgress(progress, delta, count) {
    if (progress < count) {
      console.log(`Downloading packages ${progress}-${progress + delta - 1} of ${count}`);
    }
  }


  _getPackageNamesFromHTML(html) {
    return this._parser.parse(html);
  }


  async _downloadBatch(batch) {
    return asyncForEach(batch, async (pkg) => {
      try {
        await this._downloadPackage(pkg);
      } catch (e) {
        console.error(`Error downloading package: ${pkg}`, e.message);
      }
    });
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
