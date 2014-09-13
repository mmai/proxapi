var pkg = require('../package.json')
var fs  = require('fs')

function read(n) {
  return fs.readFileSync(n, 'utf-8') }

function write(n, s) {
  return fs.writeFileSync(n, s, 'utf-8') }

function minor(a) {
  return [a[0], a[1], Number(a[2]) + 1] }

function feature(a) {
  return [a[0], Number(a[1]) + 1, 0] }

function major(a) {
  return [Number(a[0]) + 1, 0, 0] }

function bump(what, version) {
  return what === 'MAJOR'?    major(version)
  :      what === 'FEATURE'?  feature(version)
  :      /* otherwise */      minor(version) }


var old_version = pkg.version

pkg.version = bump(process.argv[2], pkg.version.split('.')).join('.')
write('package.json', JSON.stringify(pkg, null, 2))

var readme = read('README.md').replace(/proxapi-[0-9]+\.[0-9]+\.[0-9]+\./g, 'proxapi-' + pkg.version + '.');
write('README.md', readme)

console.log('Bumped from ' + old_version + ' to ' + pkg.version)
