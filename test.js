process.env.LATEST_VERSION = "11.0.2";
process.env.UPDATE_URL = "https://localhost";

var app = require("./index");
var supertest = require("supertest");
var chai = require('chai');

describe('versions', function() {

  var request;

  before(function() {
    request = supertest(app);
  });

  describe('allows getting latest version info', function() {

    it('gives 200', function(done) {
      get().expect(200, done);
    });

    it('gives version', function(done) {
      get()
        .expect({
          version: process.env.LATEST_VERSION,
          urlTemplate: 'https://localhost/releases/$OS/11.0.2/$FORMAT'}, done);
    });

    function get() {
      return request.get("/versions/latest");
    }
  });

});

describe('updates', function() {

  var request;

  before(function() {
    request = supertest(app);
  });

  describe('returns the correct update url (darwin)', function() {
    it('gives 200', function(done) {
      get().expect(200, done);
    });

    it('gives latest version', function(done) {
      get()
        .expect({
          url: process.env.UPDATE_URL + '/releases/darwin/' + process.env.LATEST_VERSION + '/zip',
          name: process.env.LATEST_VERSION,
          notes: 'Version ' + process.env.LATEST_VERSION,
          pub_date: '2015-05-14T10:20:00+00:00'}, done);
    });

    function get() {
      return request.get("/releases/latest?os=darwin&current_version=0.10.0");
    }
  });

  describe('returns the correct update url (win32)', function() {
    it('gives 200', function(done) {
      get().expect(200, done);
    });

    it('gives latest version', function(done) {
      get()
        .expect({
          url: process.env.UPDATE_URL + '/releases/win32/' + process.env.LATEST_VERSION + '/zip',
          name: process.env.LATEST_VERSION,
          notes: 'Version ' + process.env.LATEST_VERSION,
          pub_date: '2015-05-14T10:20:00+00:00'}, done);
    });

    function get() {
      return request.get("/releases/latest?os=win32&current_version=0.10.0");
    }
  });

  describe('returns the correct update url (linux)', function() {
    it('gives 200', function(done) {
      getDeb().expect(200, done);
    });

    it('gives latest version (deb)', function(done) {
      getDeb()
        .expect({
          url: process.env.UPDATE_URL + '/releases/linux/' + process.env.LATEST_VERSION + '/deb',
          name: process.env.LATEST_VERSION,
          notes: 'Version ' + process.env.LATEST_VERSION,
          pub_date: '2015-05-14T10:20:00+00:00'}, done);
    });

    it('gives latest version (rpm)', function(done) {
      getRpm()
        .expect({
          url: process.env.UPDATE_URL + '/releases/linux/' + process.env.LATEST_VERSION + '/rpm',
          name: process.env.LATEST_VERSION,
          notes: 'Version ' + process.env.LATEST_VERSION,
          pub_date: '2015-05-14T10:20:00+00:00'}, done);
    });

    function getDeb() {
      return request.get("/releases/latest?os=linux&current_version=0.10.0&package_type=deb");
    }
    function getRpm() {
      return request.get("/releases/latest?os=linux&current_version=0.10.0&package_type=rpm");
    }
  });

  describe('returns an error for missing os', function() {
    it('gives 400', function(done) {
      get().expect(400, done);
    });

    function get() {
      return request.get("/releases/latest?current_version=0.10.0");
    }
  });

  describe('returns 204 if there is not a more recent version', function() {
    it('gives 204', function(done) {
      get().expect(204, done);
    });

    function get() {
      return request.get("/releases/latest?os=darwin&current_version=99.99.99&package_type=deb");
    }
  });
});
