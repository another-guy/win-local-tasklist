import { IProcessInfo } from '../src/process-info';
import { getNewProcesses } from '../src/taskist-diff';

describe(getNewProcesses.name, () => {
  [
    {
      old: [ fake(1), fake(3), fake(5) ],
      fresh: [ fake(1), fake(2), fake(3), fake(4), fake(5) ],
      expectedDiff: [ fake(2), fake(4) ],
    },
    {
      old: [ ],
      fresh: [ fake(1), fake(2), fake(3), fake(4), fake(5) ],
      expectedDiff: [ fake(1), fake(2), fake(3), fake(4), fake(5) ],
    },
    {
      old: [ fake(5), fake(4), fake(3), fake(2), fake(1) ],
      fresh: [ fake(1), fake(2), fake(3), fake(4), fake(5) ],
      expectedDiff: [ ],
    },
  ].forEach(({ old, fresh, expectedDiff }) =>
    it(`should show ${str(expectedDiff)} as diff between ${str(old)} and ${str(fresh)}`, () => {
      expect(getNewProcesses(old, fresh)).toEqual(expectedDiff);
    })
  );
});

function str(object: any): string {
  return JSON.stringify(object);
}

function fake(pid: number): IProcessInfo {
  return {
    pid,
    imageName: '',
    memUsage: '',
    sessionName: '',
    sessionNumber: pid,
  }
}