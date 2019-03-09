// ===============================================================
//  2ch Crew Data Base のもじゅーる
// ===============================================================

const request = require('request')
const querystring = require('querystring')
const iconv = require('iconv-lite')
const cheerio = require('cheerio')

const APIURL = 'http://2chcrew.geo.jp/?'

module.exports.get = form => {
  return new Promise((resolve, reject) => {
    let result = []
    const queryObject = querystring.stringify(form)
    const url = APIURL + queryObject

    const onload = (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const bodysjis = iconv.decode(body, 'Shift_JIS')
        const $ = cheerio.load(bodysjis)
        const tbodyElem = $('.search tbody')
        const trElems = tbodyElem.find('tr')
        
        trElems.each((lineNum, trElem) => {
          const td = $(trElem).find('td')
          if (lineNum % 2) {
            let props = []
            td.each((i, tdElem) => {
              if (i >= 1 && i <= 4) {
                // artist title time bpm
                const text = $(tdElem).text()
                  .replace(/^\s+/, '')
                  .replace(/\s+$/, '')
                props.push(text !== '' && text !== '？' ? text : null)
              } else if (i === 0 || (i >= 6 && i <= 10)) {
                // update dl lylic acappella external
                const link = $(tdElem).find('a')
                props.push(link.attr('href')) // url
                props.push(link.text())       // type
                if(i === 7) {
                  props.push($(tdElem).html().split('<br>')[1]) // DL count
                }
              } else if (i === 11) {
                // thread
                const spanElem = $(tdElem).find('span')
                props.push(spanElem.attr('title'))  // date
                props.push(spanElem.text())         // thread itle
              }
            })

            let item = {}
            // if (props[1]) item.flag = { url: props[0], type: props[1] }
            if (props[2]) item.artist = props[2]
            if (props[3]) item.title = props[3]
            if (props[4]) item.time = props[4]
            if (props[5]) item.bpm = Number(props[5])
            if (props[6]) item.update = { url: props[6], type: props[7] }
            if (props[8]) item.dl = { url: props[8], type: props[9] }
            if (props[10]) item.dl.count = Number(props[10])
            if (props[11]) item.lyric = { url: props[11], type: props[12] }
            if (props[13]) item.acappella = { url: props[13], type: props[14] }
            if (props[15]) item.external = { url: props[15], type: props[16] }
            if (props[17]) item.thread = { date: props[17], title: props[18] }
            result.push(item)
          }
        })
        resolve(result)
      } else { reject(error) }
    }
    request({ url: url, encoding: null }, onload)
  })
}

