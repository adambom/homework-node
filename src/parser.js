import cheerio from 'cheerio';


export default class Parser {
  constructor(selector) {
    this.selector = selector;
  }

  parse(html, count) {
    const $ = cheerio.load(html);

    return $(this.selector)
      .slice(0, count)
      .map((i, p) => $(p).text().trim())
      .get();
  }
}
