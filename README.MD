# Full-Text Search Indexing Server <!-- omit in toc -->
Made with ❤️ by Dan Goodman

## Table of Contents <!-- omit in toc -->

- [What is This?](#what-is-this)
- [Installation](#installation)
- [Usage](#usage)
  - [Admin API](#admin-api)
  - [Client API](#client-api)
  - [WebSocket](#websocket)

## What is This?

Full-Text search indexing is an extremely powerful tool that fuels the quick searching capabilities you know and love. You know how chegg.com, google.com, amazon.com, and other websites start suggesting searches to you _as you type_? That comes from this technology. This technology is what companies like Algolia offer, and is the purpose of Apache Lucene.

This is both a project for myself to learn more about full-text search indexing, as well as an Open-Source offering to the world to host your own full-text search indexing server instead of using the free tier of Algolia, built in indexing with Mongodb Atlas, or anything else (if you prefer to host everything yourself).

This server runs both a REST API that you can use to add/list/remove indexes and models, query from, and a WebSocket server that you can have clients socket to for real-time search results (try running the simple.html after you have setup a model and some indexes to see what I mean.

## Installation

1. Clone this repository: `git clone https://github.com/danthegoodman1/fullTextSearchIndexing.git`
2. Install dependencies: `npm install`
3. Run with your preferred method (I like pm2): `node index.js`

## Usage

### Admin API

### Client API

### WebSocket
