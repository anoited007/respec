/*jshint strict: true, browser:true, jquery: true*/
/*globals define*/
// Module w3c/style
// Inserts a link to the appropriate W3C style for the specification's maturity level.
// CONFIGURATION
//  - specStatus: the short code for the specification's maturity level or type (required)
"use strict";
define(
    ["core/utils"],
    function(utils) {
      function attachFixupScript(doc, version){
        var script = doc.createElement("script");
        script.async = "async";
        var helperScript = "https://www.w3.org/scripts/TR/{version}/fixup.js"
          .replace("{version}", version);
        script.src = helperScript;
        doc.body.appendChild(script);
      }

      return {
        run: function(conf, doc, cb, msg) {
          msg.pub("start", "w3c/style");

          if (!conf.specStatus) {
            var warn = "'specStatus' missing from ReSpec config. Defaulting to 'base'.";
            conf.specStatus = "base";
            msg.pub("warn", warn);
          }

          var styleBaseURL = "https://www.w3.org/StyleSheets/TR/{version}";
          var finalStyleURL = "";
          var styleFile = "W3C-";
          var version = "";

          // Figure out which style file to use.
          switch (conf.specStatus){
            case "CG-DRAFT":
            case "CG-FINAL":
            case "BG-DRAFT":
            case "BG-FINAL":
              styleBaseURL = "https://www.w3.org/community/src/css/spec/";
              styleFile = conf.specStatus.toLowerCase();
              break;
            case "FPWD":
            case "LC":
            case "WD-NOTE":
            case "LC-NOTE":
              styleFile += "WD";
              break;
            case "FPWD-NOTE":
              styleFile += "WG-NOTE";
              break;
            case "unofficial":
              styleFile += "UD";
              break;
            case "finding":
            case "finding-draft":
            case "base":
              styleFile = "base";
              break;
            default:
              styleFile += conf.specStatus;
          }

          // Select between released styles and experimental style.
          switch (conf.useExperimentalStyles) {
            case true:
              version = new Date().getFullYear().toString();
              break;
            default:
              if(conf.useExperimentalStyles && !Number.isNaN(conf.useExperimentalStyles)){
                version = conf.useExperimentalStyles.toString().trim();
              }
          }
          // Attach W3C fixup script after we are done.
          if (version) {
            var subscribeKey = window.respecEvents.sub("end-all", function endAllHandler(){
              attachFixupScript(doc, version);
              window.respecEvents.unsub("end-all", subscribeKey);
            });
          }
          var finalVersionPath = (version) ? version + "/" : "";
          finalStyleURL = styleBaseURL.replace("{version}", finalVersionPath);
          finalStyleURL += styleFile;

          utils.linkCSS(doc, finalStyleURL);
          msg.pub("end", "w3c/style");
          cb();
        }
      };
    }
);
