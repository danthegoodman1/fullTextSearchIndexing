# Full-Text Search Indexing Server <!-- omit in toc -->
Made with ❤️ by Dan Goodman

## Table of Contents <!-- omit in toc -->

- [What is This?](#what-is-this)
    - [Features](#features)
- [Installation](#installation)
- [To-Do:](#to-do)
- [Usage](#usage)
  - [Admin API](#admin-api)
      - [Model Endpoints](#model-endpoints)
      - [Index Endpoints](#index-endpoints)
  - [Client API](#client-api)
      - [Query Endpoints](#query-endpoints)
  - [WebSocket](#websocket)
      - [JWT Generation Endpoint](#jwt-generation-endpoint)
      - [WebSocket Configuration](#websocket-configuration)

## What is This?

Full-Text search indexing is an extremely powerful tool that fuels the quick searching capabilities you know and love. You know how chegg.com, google.com, amazon.com, and other websites start suggesting searches to you _as you type_? That comes from this technology. This technology is what companies like Algolia offer, and is the purpose of Apache Lucene.

This is both a project for myself to learn more about full-text search indexing, as well as an Open-Source offering to the world to host your own full-text search indexing server instead of using the free tier of Algolia, built in indexing with Mongodb Atlas, or anything else (if you prefer to host everything yourself).

This server runs both a REST API that you can use to add/list/remove indexes and models, query from, and a WebSocket server that you can have clients socket to for real-time search results (try running the simple.html after you have setup a model and some indexes to see what I mean). It saves everything to disk as it is updated, and loads them into memory on start.

#### Features

- Add/Delete Index Models
- List Index Models
- Add/Delete Indexes
- List Indexes
- Query Indexes
- WebSocketed real-time search
- Client/Admin API access
- JWT WebSocket Security
- Expanded Search

## Installation

1. Clone this repository: `git clone https://github.com/danthegoodman1/fullTextSearchIndexing.git`
2. Install dependencies: `npm install`
3. Run with your preferred method (I like pm2): `npm start`

## To-Do:

- Add pagination/limit to query endpoint and websocket (or hard code a certain amount of responses)
- Add local clustering for multi-threaded performance

## Usage

On first startup, a `clientkey`, `adminkey`, and `jwtsecret` file will be generated. In these files is where you can find the appropriate key to make the appropriate request/connection. These keys can be reset simply by deleting the files and restarting the server. Furthermore, models (and their indexes) are saved on any creation/deletion event, and are stored in a `saves` folder with the name of the file being the model name. These can be deleted manually by deleting the file and restarting the server. On every server startup they will be read from and loaded in.

Here is a WebSocket speed example with **46152 indexes**:

*(Running on a DigitalOcean 2vCPU, 4GB Standard Droplet)*

![example](/assets/example.gif)

### Admin API

##### Model Endpoints

**POST** `/models/addModel`

Add a model

JSON Body:
```js
{
    modelName: String,
    fields: [
        String
    ],
    adminkey: String
}
```

Example:
```js
{
	modelName: "testModel",
	fields: [
		"name",
		"description"
	],
	adminkey: "55d438cb-16fc-4726-8ecc-219f3ff6607c"
}
```
**NOTE:** the field `id` is what is used as a reference to a index document. It will be defined in the backend regardless of whether you define it in the request.

**POST** `/models/list`

List models

JSON Body:
```js
{
    adminkey: String
}
```

Example:

```js
{
    adminkey: "55d438cb-16fc-4726-8ecc-219f3ff6607c"
}
```

**POST** `/models/deleteModel`

Deletes a model and all of its documents

JSON Body:
```js
{
    modelName: String,
    adminkey: String
}
```

Example:
```js
{
    modelName: "testModel",
    adminkey: "55d438cb-16fc-4726-8ecc-219f3ff6607c"
}
```

##### Index Endpoints

**POST** `/index/add`

Adds an index to a model

JSON Body:
```js
{
    doc: {
        field: String
    },
    modelName: String,
    adminkey: String
}
```

Example:
```js
{
	doc: {
		name: "Dan Goodman",
		description: "Dan Goodman is the developer of this sweet software"
	},
	modelName: "testModel",
	adminkey: "55d438cb-16fc-4726-8ecc-219f3ff6607c"
}
```

**POST** `/index/list`

List all indexes in a model

**WARNING** This will send you everything and a single request. This endpoint should be used for early development purposes only, thus why it is restricted to the admin key.

JSON Body:
```js
{
    modelName: String,
    adminkey: String
}
```

Example:
```js
{
    modelName: "testModel",
	adminkey: "55d438cb-16fc-4726-8ecc-219f3ff6607c"
}
```

**POST** `/index/delete`

Deletes an index

JSON Body:
```js
{
    modelName: String,
    id: String,
    adminkey: String
}
```

Example:
```js
{
    modelName: "testModel",
    id: "k31s3uev"
	adminkey: "55d438cb-16fc-4726-8ecc-219f3ff6607c"
}
```

### Client API

##### Query Endpoints

**POST** `/q/`

Search for an index

JSON Body:
```js
{
    search: String,
	modelName: String,
	fields: { // Optional, see elasticlunr documentation
		field: {
			boost: Number
                }
    },
    expand: Boolean, // Optional
    fuzzy: { // Optional
        length: Number
    }
    clientkey: String,
    adminkey: String // Can use adminkey here also, must specify as adminkey
}
```

The `expand` field will enable a search like `buy` to also match `buyer` `buys` `buying`, etc.

The `fuzzy` field will also query the DataMuse API for words that are similar to the search term, and perform the same index on those words in addition to the initial search. This has been restricted to the HTTP endpoint and not the WebSocket search since this is a much heavier operation.

Example:
```js
    search: "Dan Goodman",
	modelName: "testModel",
	fields: {
		name: {
			boost: 1
                },
        description: {
            boost: 2
                },
    expand: true,
    fuzzy: {
        length: 3
    }
	},
	clientkey: "92d12e68-bca4-4bd1-899f-cf81f15bcfd8"
```

### WebSocket

Clients can also WebSocket to the server and query in real time. See `simple.html` for an example. They must first use the api to obtain a JSON web token by hitting the following endpoint

##### JWT Generation Endpoint

**POST** `/auth/generatejwt`

JSON Body:
```js
{
    clientkey: String
}
```

JSON Reponse:
```js
{
    token: String
}
```

You then need to use this key when connecting with the socket. These tokens are set to expire 12 hours after they are issued. this can be changed in the `http.js` file.

##### WebSocket Configuration

**WebSocket Endpoint:** `/?token=JWT` JWT = response of the `/auth/generatejwt` endpoint

**WebSocket Payload**:
```js
JSON.stringify({
    search: String,
    modelName: String,
    fields: { // Optional
        field: {
            boost: Number
        }
    },
    expand: Boolean // Optional
})
```

**WebSocket Search Response** ("message" event.data):

JSON Response:
```js
[
    {response} // Array of response objects
]
```

The response object is the model object including a score. The array is sorted descending by score by default.
