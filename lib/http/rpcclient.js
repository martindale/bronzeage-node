/*!
 * rpcclient.js - json rpc client for decentraland
 * Copyright (c) 2014-2016, Christopher Jeffrey (MIT License).
 * Copyright (c) 2016-2017, Manuel Araoz (MIT License).
 * Copyright (c) 2016-2017, Yemel Jardi (MIT License).
 * https://github.com/decentraland/decentraland-node
 */

'use strict';

var Network = require('../protocol/network');
var request = require('./request');
var co = require('../utils/co');

/**
 * Decentraland RPC client.
 * @exports RPCClient
 * @constructor
 * @param {String} uri
 * @param {Object?} options
 */

function RPCClient(options) {
  if (!(this instanceof RPCClient))
    return new RPCClient(options);

  if (!options)
    options = {};

  if (typeof options === 'string')
    options = { uri: options };

  this.options = options;
  this.network = Network.get(options.network);

  this.uri = options.uri || 'http://localhost:' + this.network.rpcPort;
  this.apiKey = options.apiKey;
  this.id = 0;
}

/**
 * Make a json rpc request.
 * @private
 * @param {String} method - RPC method name.
 * @param {Array} params - RPC parameters.
 * @returns {Promise} - Returns Object?.
 */

RPCClient.prototype.call = co(function* call(method, params) {
  var res = yield request.promise({
    method: 'POST',
    uri: this.uri,
    pool: true,
    json: {
      method: method,
      params: params,
      id: this.id++
    },
    auth: {
      username: 'bitcoinrpc',
      password: this.apiKey || ''
    },
    expect: 'json',
    timeout: 10000
  });

  if (!res.body)
    return;

  if (res.statusCode === 400)
    return res.body.result;

  if (res.statusCode !== 200) {
    if (res.body.error)
      throw new Error(res.body.error.message);
    throw new Error('Status code: ' + res.statusCode);
  }

  return res.body.result;
});

/*
 * Expose
 */

module.exports = RPCClient;
