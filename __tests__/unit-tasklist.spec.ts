import { IProcessInfo } from '../src/process-info';
import { ctx, getColumnLengths, orderedParts, tasklist } from '../src/tasklist';

describe(tasklist.name, () => {
  it(`should reject promise when exec() errors out`, async () => {
    const expectedError = `Specific error`;
    setExecToError(expectedError);

    try {
      await tasklist();
    } catch (e) {
      expect(e).toEqual(new Error(expectedError));
    }
  });

  it(`should reject promise when exec() writes to stderr`, async () => {
    const expectedError = `Specific error`;
    setExecToStderr(expectedError);

    try {
      await tasklist();
    } catch (e) {
      expect(e).toEqual(expectedError);
    }
  });
});

describe(getColumnLengths.name, () => {
  [
    { input: '== !', expectedChar: '!' },
    { input: '== = = ===% = =', expectedChar: '%' },
  ].forEach(({ input, expectedChar }) =>
    it(`should throw error for line ${input} when finds '${expectedChar}'`, () => {
      expect(() => getColumnLengths(input))
        .toThrow(`Did not expect to observe '${expectedChar}'.`);
    })
  );
});

describe(orderedParts.name, () => {
  [
    { columnLengthList: [2, 3, null], expectedForbiddenValue: null },
    { columnLengthList: [1, undefined], expectedForbiddenValue: undefined },
  ].forEach(({ columnLengthList, expectedForbiddenValue }) => {
    it(`should throw when finds ${expectedForbiddenValue} in columnLengthList`, () => {
      expect(() => orderedParts('qwertyuiopasdfghjklzxcvbnm', columnLengthList))
        .toThrow(`columnLength can not be ${expectedForbiddenValue}.`);
    });
  });
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

function setExecToError(text: string): void {
  ctx.exec = (command, callback) => {
    callback(new Error(text), null, null);
    return null;
  };
};

function setExecToStderr(text: string): void {
  ctx.exec = (command, callback) => {
    callback(null, null, text);
    return null;
  };
};
