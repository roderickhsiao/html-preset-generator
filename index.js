import auto from 'async/auto';
import cheerio from 'cheerio';
import htmlTags from 'html-tags';
import request from 'superagent';

import { get } from 'lodash';

const MDN_PATH = 'https://developer.mozilla.org/en-US/docs/Web/HTML';
var htmlAttr = {};
var tasks = {};

const eventLists = [ "onabort", "onautocomplete", "onautocompleteerror", "onblur", "oncancel", "oncanplay", "oncanplaythrough", "onchange", "onclick", "onclose", "oncontextmenu", "oncuechange", "ondblclick", "ondrag", "ondragend", "ondragenter", "ondragexit", "ondragleave", "ondragover", "ondragstart", "ondrop", "ondurationchange", "onemptied", "onended", "onerror", "onfocus", "oninput", "oninvalid", "onkeydown", "onkeypress", "onkeyup", "onload", "onloadeddata", "onloadedmetadata", "onloadstart", "onmousedown", "onmouseenter", "onmouseleave", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onmousewheel", "onpause", "onplay", "onplaying", "onprogress", "onratechange", "onreset", "onresize", "onscroll", "onseeked", "onseeking", "onselect", "onshow", "onsort", "onstalled", "onsubmit", "onsuspend", "ontimeupdate", "ontoggle", "onvolumechange", "onwaiting" ];

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
            // blacklist event
            if (eventLists.indexOf(text) === -1) {
              allowedAttr.push(text);
            }
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
        // blacklist event
        if (eventLists.indexOf(text) === -1) {
          allowedAttr.push(text);
        }      });
      htmlAttr['*'] = allowedAttr;
      cb();
    });
};

createTasks(htmlTags);
auto(tasks, () => {
  console.log(htmlAttr);
});
