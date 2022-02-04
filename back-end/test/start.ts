import 'reflect-metadata';
import { cleanUpMetadata } from 'inversify-express-utils';
import Jasmine from 'jasmine';
import moment from 'moment';
import 'moment-timezone';

// add additional namespaces to Express.*
import 'multer';

// @ts-ignore - this package have no @types defined
import prettyReporter = require('jasmine-pretty-html-reporter');
// @ts-ignore
import ConsoleReporter = require('jasmine-console-reporter');
import { argv, argv0 } from 'process';


const jasmine = new Jasmine({});
jasmine.loadConfig({
  spec_dir: '',
  spec_files: [
    'src/**/*.spec.ts',
    'test/**/*.spec.ts',
  ],
  stopSpecOnExpectationFailure: true,
  failSpecWithNoExpectations: true,
  random: true
});

// jasmine.seed(57672);

// jasmine.env.clearReporters();
// jasmine.addReporter(new ConsoleReporter({
//   verbosity: { specs: false },
//   activity: true
//  }));
jasmine.addReporter(new prettyReporter.Reporter({
  path: 'report-test'
}));

beforeEach(() => {
  cleanUpMetadata();
  process.env.NODE_ENV = 'test';
  moment.tz.setDefault('UTC'); // to avoid DST mismatches
});

const file = argv[2];

if (file) {
  jasmine.execute([file]);
} else {
  jasmine.execute();
}
