// ===========================
// cdb2ch.get({
//   パラメータ: 値
// }).then(コールバック)
// ===========================

const cdb2ch = require('./index.js')

cdb2ch.get({
  sword: 'search',
  k: '1',
  s0: 'sort_date_new',
  s1: '',
  s2: 'みんなでラップミュージックをつくろう.pt.8',
  c: 'on',
  page: 0
}).then(result => {
  console.log(result)
})
