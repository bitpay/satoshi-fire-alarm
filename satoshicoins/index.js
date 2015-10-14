var index = require('../../node_modules/bitcore-node');
var log = index.log;
var util = require('util');
var Service = require('../../node_modules/bitcore-node/lib/service');
var Transaction = require('../../node_modules/bitcore-node/lib/transaction');
var spawn = require('child_process').spawn;

function SatoshiCoins(options) {
  Service.call(this, options);
  this.alarmActivated = false;
  this.child;
  this.interestingAddresses = [
    '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', //this is the address that the genesis paid its coinbase to. Can't be spent due to a bug in the code.
    '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX', //Block 1
    '1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1' //Block 2
  ];
  this.node.services.bitcoind.on('tx', this.transactionHandler.bind(this));
}

/*
 * We are going to need bitcoind because we will be setting event listeners (subscribers)
 * on Blocks and such
 */
SatoshiCoins.dependencies = ['bitcoind', 'db', 'address'];

/*
 * inherits the serivce base class so we get some stuff for free
 */
util.inherits(SatoshiCoins, Service);

/*
 * start: REQUIRED!! Ours just calls the callback
 */
SatoshiCoins.prototype.start = function(callback) {
  callback();
}

/*
 * stop: REQUIRED!! Ours just calls the callback
 */
SatoshiCoins.prototype.stop = function(callback) {
  callback();
}

/*
 * transactionHandler: this is the delegate when a transaction is received by your node
 */
SatoshiCoins.prototype.transactionHandler = function(txinfo) {
  var tx = bitcore.Transaction().fromBuffer(txInfo.buffer);

  var messages = {};

  var inputsLength = tx.inputs.length;
  for (var i = 0; i < inputsLength; i++) {
    this.transactionInputHandler(tx, i);
  }

}

/*
 * transactionInputHandler: helper for transactionHandler
 */
SatoshiCoins.prototype.transactionInputHandler = function(tx, i) {
  var address = tx.inputs[i].script.toAddress();

  if (typeof address !== 'undefined' &&
      this.interestingAddresses.indexOf(address) != -1) {
    this.soundAlarm();
  }
}

/*
 * soundAlarm: will launch a separate alarm program (not provided)
 */
SatoshiCoins.prototype.soundAlarm = function() {
  if (this.alarmActivated) return;

  this.alarmActivated = true;
  var child = spawn('alarm', []);
}

SatoshiCoins.prototype.resetAlarm = function() {
  child.kill();
  this.alarmActivated = false;
}

module.exports = SatoshiCoins;

