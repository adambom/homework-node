import cheerio from 'cheerio';


export default class Parser {
  constructor(selector) {
    this.selector = selector;
  }

  parse(html) {
    const $ = cheerio.load(html);

    return $(this.selector)
      .map((i, p) => $(p).text().trim())
      .get();
  }
}
