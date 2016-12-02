import ma = require('vsts-task-lib/mock-answer');
import tmrm = require('vsts-task-lib/mock-run');
import path = require('path');
import fse = require('fs-extra');
import mockfs = require('mock-fs');
import assert = require('assert');

let rootDir = path.join(__dirname, '..', 'instrumented');
let taskPath = path.join(rootDir, 'tokenizer.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

// provide answers for task mock
let a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
    "checkPath": {
        "working": true
    },
    "glob": {
        "working\\appsettings.json" : [ path.join("working", "appsettings.json") ]
    }
};
tmr.setAnswers(a);

// mock the fs
let _mockfs = mockfs.fs({
    "working/appsettings.json": `
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\\\mssqllocaldb;Database=aspnet-WebApplication1-26e8893e-d7c0-4fc6-8aab-29b59971d622;Trusted_Connection=True;MultipleActiveResultSets=true"
  },
  "Tricky": {
    "Tricky": "Tricky",
    "Tricky1": {
        "Tricky2": "Tricky"
    }
  },
  "Logging": {
    "IncludeScopes": false,
    "LogLevel": {
      "Default": "Debug",
      "System": "Information",
      "Microsoft": "Information"
    }
  }
}
`});
tmr.registerMock('fs', _mockfs);

// set inputs
tmr.setInput('sourcePath', "working");
tmr.setInput('filePattern', 'appsettings.json');
tmr.setInput('tokenizeType', 'Json');
tmr.setInput('includes', 'ConnectionStrings.DefaultConnection,Logging.LogLevel.Default'); 
tmr.setInput('excludes', '');

tmr.run();

// validate the replacement
let actual = (<any>_mockfs).readFileSync('working/appsettings.json', 'utf-8');
var expected = `{
  "ConnectionStrings": {
    "DefaultConnection": "__ConnectionStrings.DefaultConnection__"
  },
  "Tricky": {
    "Tricky": "Tricky",
    "Tricky1": {
      "Tricky2": "Tricky"
    }
  },
  "Logging": {
    "IncludeScopes": false,
    "LogLevel": {
      "Default": "__Logging.LogLevel.Default__",
      "System": "Information",
      "Microsoft": "Information"
    }
  }
}`;

if (actual !== expected) {
  console.log(actual);
  console.error("Tokenization failed.");
} else {
  console.log("Tokenization succeeded!")
}