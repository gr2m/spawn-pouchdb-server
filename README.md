# spawn-pouchdb-server

> Configurable per-app pouchdb-server as a drop-in replacement for CouchDB

[![NPM version](https://badge.fury.io/js/spawn-pouchdb-server.svg)](https://www.npmjs.com/package/spawn-pouchdb-server)
[![Build Status](https://travis-ci.org/gr2m/spawn-pouchdb-server.svg?branch=master)](https://travis-ci.org/gr2m/spawn-pouchdb-server)
[![Dependency Status](https://david-dm.org/gr2m/spawn-pouchdb-server.svg)](https://david-dm.org/gr2m/spawn-pouchdb-server)

## Motivation

1. Simplify development setup

   CouchDB is a fantastic database, but setting it up for local development is not easy, as it also
   requires an Erlang runtime environment. Having a built-in PouchDB-Server in our apps will make
   CouchDB optional.

2. Isolated CouchDB configurations

   Many Apps require couchdb users / admins / security settings etc. Using PouchDB makes it simple
   to isolate these in local development. (But if you don't mind the CouchDB dependency,
   you can also use [node-multicouch](https://github.com/hoodiehq/node-multicouch) for that).

## Usage

```js
// npm install --save spawn-pouchdb-server
var spawnPouchdbServer = require('spawn-pouchdb-server')

spawnPouchdbServer({
  port: 5985,
  databaseDir: './.db',
  log: {
    file: './.db/pouch.log'
  }
}, function (error) {
  console.log('PouchDB Server stared at localhost:5985/_utils')
})
```

## Local setup & tests

```bash
git clone git@github.com:gr2m/spawn-pouchdb-server.git
cd spawn-pouchdb-server
npm install
npm test
```

## License

MIT
