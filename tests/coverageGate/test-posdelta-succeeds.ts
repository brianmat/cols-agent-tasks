import ma = require('vsts-task-lib/mock-answer');
import tmrm = require('vsts-task-lib/mock-run');
import path = require('path');
import assert = require('assert');
import mocks = require('./mocks');

let rootDir = path.join(__dirname, '../../Tasks', 'CoverageGate');
let taskPath = path.join(rootDir, 'coverageGate.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

// provide mocks
mocks.MockWebApi.covData = {
    coverageData: [{
        coverageStats: [
          {
            isDeltaAvailable: true,
            label: 'Lines',
            delta: 2
          },
          {
            isDeltaAvailable: true,
            label: 'Blocks',
            delta: 1
          }
        ]
      }
    ]
  };
tmr.registerMock('azure-devops-node-api/WebApi', mocks.MockWebApi);

// set variables
process.env["SYSTEM_TEAMFOUNDATIONCOLLECTIONURI"] = "http://localhost:8080/tfs/defaultcollection";
process.env["SYSTEM_TEAMPROJECT"] = "demo";
process.env["BUILD_BUILDID"] = "1";
process.env["SYSTEM_ACCESSTOKEN"] = "faketoken";

// set inputs
tmr.setInput('minDelta', "1.5");
tmr.setInput('operator', "lt");

tmr.run();