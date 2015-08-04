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

spawnPouchdbServer(function (error) {
  console.log('PouchDB Server stared at localhost:5985/_utils')
})
```

Full example with all options (and default values)

```js
// npm install --save spawn-pouchdb-server
var spawnPouchdbServer = require('spawn-pouchdb-server')

spawnPouchdbServer({
  port: 5985,
  directory: './.db',
  backend: {
    name: 'leveldown',
    dir: './.db'
  },
  log: {
    file: './.db/pouch.log',
    level: 'info'
  },
  config: {
    file: './.db/config.json'
  }
}, function (error) {
  console.log('PouchDB Server stared at localhost:5985/_utils')
})
```

## Options

<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Description</th>
      <th>default</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>port</th>
      <td>Port number where CouchDB API will be exposed</td>
      <td><code>5985</code></td>
    </tr>
    <tr>
      <th>directory</th>
      <td>Directory where PouchDB server will store it's files. Also default location for file based levelup back-ends</td>
      <td><code>5985</code></td>
    </tr>
    <tr>
      <th>backend</th>
      <td>Either an object with <code>name</code> and <code>location</code> properties (see below), or <code>false</code> for in-memory</td>
      <td><em>see below</em></td>
    </tr>
    <tr>
      <th>backend.name</th>
      <td>npm module name of <a href="https://github.com/Level/levelup/wiki/Modules#storage-back-ends">levelup storage back-end</a></td>
      <td><em>built in leveldown</em></td>
    </tr>
    <tr>
      <th>backend.location</th>
      <td>Location option as passed to <a href="https://github.com/Level/levelup#leveluplocation-options-callback">levelup(location)</a></td>
      <td><code>"./.db"</code></td>
    </tr>
    <tr>
      <th>log.file</th>
      <td>Location of log file. Set to <code>false</code> to disable logging to a file. <code>log.file</code> is an alias for <code>config.log.file</code>. Set to <code>false</code> to not persist logs</td>
      <td><code>"./.db/pouch.log"</code></td>
    </tr>
    <tr>
      <th>log.level</th>
      <td>One of <code>debug</code>, <code>info</code>, <code>warning</code>, <code>error</code>, <code>none</code>. <code>log.level</code> is an alias for <code>config.log.level</code></td>
      <td><code>"info"</code></td>
    </tr>
    <tr>
      <th>config.file</th>
      <td>Location of CouchDB-esque config file. Set to <code>false</code> to not persist configuration.</td>
      <td><code>"./.db/config.json"</code></td>
    </tr>
    <tr>
      <th>config.*</th>
      <td>All the <a href="http://docs.couchdb.org/en/latest/config/index.html">CouchDB Configuration</a>, e.g. <code>config.admins = {"adminuser": "adminpass"}</code> to fix <a href="http://guide.couchdb.org/draft/security.html#party">admin party</a></td>
      <td></td>
    </tr>
  </tbody>
</table>

## Local setup & tests

```bash
git clone git@github.com:gr2m/spawn-pouchdb-server.git
cd spawn-pouchdb-server
npm install
npm test
```

## License

MIT
