import auto from 'async/auto';
import cheerio from 'cheerio';
import htmlTags from 'html-tags';
import request from 'superagent';

import { get } from 'lodash';

const MDN_PATH = 'https://developer.mozilla.org/en-US/docs/Web/HTML';
var htmlAttr = {};
var tasks = {};

function createTasks(htmlTags) {
  htmlTags.forEach((tag) => {
    tasks[tag] = (cb) => {
      request
        .get(`${MDN_PATH}/Element/${tag}`)
        .end((err, res) => {
          let allowedAttr = [];
          let $ = cheerio.load(get(res, ['res', 'text']));
          let attrsList = $('#wikiArticle dt strong[id^="attr-"] code');
          attrsList.each((i, eachTag) => {
            let text = $(eachTag).text();
            allowedAttr.push(text);
          });
          htmlAttr[tag] = allowedAttr;
          cb();
        });
    }
  });
};

// global attributes
tasks['*'] = (cb) => {
  request
    .get(`${MDN_PATH}/Global_attributes`)
    .end((err, res) => {
      let allowedAttr = [];
      let $ = cheerio.load(get(res, ['res', 'text']));
      let attrsList = $('#wikiArticle dt[id^="attr-"] a');
      attrsList.each((i, eachTag) => {
        let text = $(eachTag).text();
        allowedAttr.push(text);
      });
      htmlAttr['*'] = allowedAttr;
      cb();
    });
};

createTasks(htmlTags);
auto(tasks, () => {
  console.log(htmlAttr);
});
