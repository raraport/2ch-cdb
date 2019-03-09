// ===============================================================
//  2ch Crew Data Base のもじゅーる
// ===============================================================

const request = require('request')
const querystring = require('querystring')
const iconv = require('iconv-lite')
const cheerio = require('cheerio')

const APIURL = 'http://2chcrew.geo.jp/?'

const get = form => {
  return new Promise((resolve, reject) => {
    const queryObject = querystring.stringify(form)
    const url = APIURL + queryObject

    const onload = (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const bodysjis = iconv.decode(body, 'Shift_JIS')
        const $ = cheerio.load(bodysjis)
        const tbody = $('.search tbody')
        const tr = tbody.find('tr')

        let result = []
        tr.each((i, trElem) => {
          const td = $(trElem).find('td')
          if (i % 2) {
            let props = []
            td.each((i, tdElem) => {
              if (i >= 1 && i <= 4) {
                const text = $(tdElem).text().replace(/^\s+/, '').replace(/\s+$/, '')
                props.push(text !== '' && text !== '？' ? text : null)
              } else if (i === 0 || (i >= 6 && i <= 10)) {
                const link = $(tdElem).find('a')
                props.push(link.attr('href'))
                props.push(link.text())
                if(i === 7) {
                  props.push($(tdElem).html().split('<br>')[1])
                }
              } else if (i === 11) {
                const span = $(tdElem).find('span')
                props.push(span.attr('title'))
                props.push(span.text())
              }
            })
            result.push({
              view: props[1] ? {
                url: props[0],
                type: props[1]
              }:null,
              artist: props[2],
              title: props[3],
              time: props[4],
              bpm: props[5] ? Number(props[5]) : null,
              update: props[6] ?{
                url: props[6],
                type: props[7]
              }:null,
              dl: props[8] ?{
                url: props[8],
                type: props[9],
                count: props[10] ? Number(props[10]) : null,
              }:null,
              lyric: props[11] ?{
                url: props[11],
                type: props[12]
              }:null,
              acappella: props[13] ? {
                url: props[13],
                type: props[14]
              }:null,
              external: props[15] ? {
                url: props[15],
                type: props[16]
              }: null,
              thread: {
                date: props[17],
                title: props[18]
              }
            })
          }
        })
        resolve(result)
      }
    }
    request({ url: url, encoding: null }, onload)
  })
}

module.exports.get = get
