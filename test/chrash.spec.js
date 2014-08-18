var lab = exports.lab = require('lab').script();
var sinon = require('sinon');
var chai = require('chai');
var describe = lab.describe;
var it = lab.it;
var beforeEach = lab.beforeEach;
var afterEach = lab.afterEach;
var expect = chai.expect;

var Chrash = require('../lib/chrash');

describe('chrash', function () {

  beforeEach(function (done) {
    this.clock = sinon.useFakeTimers();
    done();
  });

  afterEach(function (done) {
    this.clock.restore();
    delete this.clock;
    done();
  });

  var createIncrementingChrash = function (polling, delayedUpdateInterval) {
    var self = this;

    return new Chrash({
      polling: polling,
      update: function (cache, afterUpdate) {
        self.updating = self.setTimeout(function () {
          var newCache = {
            updates: (cache.updates || 0) + 1
          };
          afterUpdate(null, newCache);
        }, delayedUpdateInterval);
      }
    });
  };

  var createBadChrash = function (polling, delayedUpdateInterval) {
    var self = this;

    return new Chrash({
      polling: polling,
      update: function (cache, afterUpdate) {
        self.updating = self.setTimeout(function () {
          afterUpdate(new Error('bad cache'));
        }, delayedUpdateInterval);
      }
    });
  };

  describe('when update fails', function () {

    beforeEach(function (done) {
      this.chrash = createBadChrash.call(this, 1, 3);
      this.errorListenerStub = sinon.stub();
      this.chrash.on('error', this.errorListenerStub);
      done();
    });

    afterEach(function (done) {
      delete this.chrash;
      delete this.errorListenerStub;
      done();
    });

    it('should detect that error was emitted', function (done) {
      expect(this.errorListenerStub).to.not.have.been.called;
      this.clock.tick(5);
      expect(this.errorListenerStub).to.have.been.called;
      done();
    });

  });

  describe('when updates execute within polling interval', function () {

    beforeEach(function (done) {
      this.chrash = createIncrementingChrash.call(this, 3, 1);
      done();
    });

    afterEach(function (done) {
      delete this.chrash;
      clearTimeout(this.updating);
      delete this.updating;
      done();
    });

    it('should see that cache is properly updated', function (done) {
      expect(this.chrash.get('updates')).to.not.exist;
      this.clock.tick(2);
      expect(this.chrash.get('updates')).to.equal(1);
      this.clock.tick(2);
      expect(this.chrash.get('updates')).to.equal(1);
      this.clock.tick(2);
      expect(this.chrash.get('updates')).to.equal(2);
      this.clock.tick(2);
      expect(this.chrash.get('updates')).to.equal(3);
      done();
    });
  });

  describe('when updates execute outside polling interval', function () {

    beforeEach(function (done) {
      this.chrash = createIncrementingChrash.call(this, 3, 5);
      done();
    });

    afterEach(function (done) {
      delete this.chrash;
      clearTimeout(this.updating);
      delete this.updating;
      done();
    });

    it('should see that cache is properly updated', function (done) {
      expect(this.chrash.get('updates')).to.not.exist;
      this.clock.tick(2);
      expect(this.chrash.get('updates')).to.not.exist;
      this.clock.tick(4);
      expect(this.chrash.get('updates')).to.equal(1);
      this.clock.tick(8);
      expect(this.chrash.get('updates')).to.equal(2);
      done();
    });
  });

  describe('when stopped', function () {

    beforeEach(function (done) {
      this.chrash = createIncrementingChrash.call(this, 3, 1);
      done();
    });

    afterEach(function (done) {
      delete this.chrash;
      clearTimeout(this.updating);
      delete this.updating;
      done();
    });

    it('should see that cache is not subsequently updated', function (done) {
      expect(this.chrash.get('updates')).to.not.exist;
      this.chrash.stop();
      this.clock.tick(20);
      expect(this.chrash.get('updates')).to.not.exist;
      done();
    });

    it('should see that cache is stopped after first update', function (done) {
      expect(this.chrash.get('updates')).to.not.exist;
      this.clock.tick(2);
      this.chrash.stop();
      expect(this.chrash.get('updates')).to.equal(1);
      this.clock.tick(20);
      expect(this.chrash.get('updates')).to.equal(1);
      done();
    });

  });
});
