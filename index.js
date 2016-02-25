/**
 * update and latest version server
 *
 * latest version
 *   GET /versions/latest?os=[darwin|linux|win32];format=[dmg|exe|deb|rpm]
 *
 * update
 *   GET /releases/latest?current_version=x.y.z;os=[darwin|linux|win32];packageType=[deb|rpm]
 *
 *   200 = install this update
 *   204 = nothing to update
 *
 */

var express = require("express");
var pkg = require("./package.json");
var morgan = require("morgan");
var semver = require("semver");

var app = express();
app.use(morgan("short"));

module.exports = exports = app;

// CORS - public site calls to get latest version, and there's nothing here
// that isn't safe to allow general access to
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var UPDATE_URL = process.env.UPDATE_URL;
var LATEST_VERSION = process.env.LATEST_VERSION;

if(!UPDATE_URL) {
  throw new Error("missing UPDATE_URL env var");
}

if(!LATEST_VERSION) {
  throw new Error("missing LATEST_VERSION env var");
}

/**
 * Called from the public site to get the latest version information to display and the download url
 * No checks are made to match the format with the os
 */
app.get("/versions/latest", function(req, res) {
  res.send({
    version: LATEST_VERSION,
    urlTemplate: downloadUrl("$OS", LATEST_VERSION, "$FORMAT"),
  });
});

/**
 * Called by our app (via electron autoUpdate) to get the autoUpdate package url.
 * Can also be called directly in browser to get latest version (for debugging/sanity check)
 * No check is made that the package type is valid for the os
 *
 * n.b. only linux requires packageType to be sent
 *
 */
app.get("/releases/latest", function(req, res) {
  var version = req.query.current_version;
  var os = req.query.os;
  var packageType = req.query.package_type;

  if(version){
    // return nothing to do if the user's current version is NOT less than the latest version
    if(!semver.lt(version, LATEST_VERSION)) {
      return res.send(204);
    }
  }

  if(!os) {
    return res.status(400).send({
      error: "missing os",
    })
  }

  var url = downloadUrl(os, LATEST_VERSION, packageType);
  var response = {
    "url": url,
    "name": LATEST_VERSION,
    "notes": "Version " + LATEST_VERSION,
    "pub_date": "2015-05-14T10:20:00+00:00",
  };

  res.send(response);
});

/**
 * Returns the download url in the form releases/os/version/format, e.g.
 * http://releases.sidekickjs.com/releases/darwin/0.16.0/zip
 *
 * Note, the format will always be zip for darwin and win32 (squirrel update format). For linux, the format is deb|rpm.
 * @param os
 * @param version
 * @param packageType
 * @returns {string}
 */
function downloadUrl(os, version, packageType) {
  return UPDATE_URL + "/releases/" + os + "/" + version + "/" + (packageType || "zip");
}

if(require.main === module) {
  var PORT = process.env.PORT || 80;
  app.listen(PORT, function() {
    console.log(pkg.name + " " + pkg.version + " listening on " + PORT);
  });
}
