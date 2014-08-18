var lab = exports.lab = require('lab').script();
var sinon = require('sinon');
var chai = require('chai');
var describe = lab.describe;
var it = lab.it;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;
var expect = chai.expect;

var index = require('../index');

describe('init', function () {

  beforeEach(function (done) {
    this.clock = sinon.useFakeTimers();
    done();
  });

  afterEach(function (done) {
    this.clock.restore();
    delete this.clock;
    done();
  });

  it('should throw error if not given an update function', function (done) {
    expect(function () {
      index.init();
    }).to.throw('must be initialized with an update function');
    expect(function () {
      index.init({
        polling: 3
      });
    }).to.throw('must be initialized with an update function');
    done();
  });

  it('should throw err if not given an init callback', function (done) {
    expect(function () {
      index.init({
        polling: 0,
        update: function (cache, afterUpdate) {
          afterUpdate(null, {});
        }
      });
    }).to.throw('must be provided a callback for initialization');
    done();
  });

  it('should set default polling if invalid given', function (done) {
    index.init({
      polling: 0,
      update: function (cache, afterUpdate) {
        afterUpdate(null, {});
      }
    }, function (err, chrash) {
      expect(err).to.not.exist;
      expect(chrash).to.have.property('polling', 30000);
      done();
    });
    this.clock.tick(40);
  });

  it('should be able to catch errors on init', function (done) {
    index.init({
      polling: 0,
      update: function (cache, afterUpdate) {
        afterUpdate(new Error('bad init'));
      }
    }, function (err, chrash) {
      expect(err).have.property('message', 'bad init');
      done();
    });
    this.clock.tick(10);
  });

  it('should be able to catch errors on timeout', function (done) {
    var self = this;

    index.init({
      polling: 1,
      update: function (cache, afterUpdate) {
        self.setTimeout(function () {
          afterUpdate(null, {});
        }, 5);
      }
    }, function (err, chrash) {
      expect(err).have.property('message', 'initial update timed out');
      done();
    });
    this.clock.tick(10);
  });
});
