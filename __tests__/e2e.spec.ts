import { exec } from 'child_process';

import { getNewProcesses } from '../src/taskist-diff';
import { tasklist } from '../src/tasklist';

describe(`End-to-end test`, () => {
  it(`Should tasklist and calculate process diff correctly`, async () => {
    const old = await tasklist()
    const [ error, stdout, stderr ] = await execAsPromise(`cmd /?`);
    const fresh = await tasklist();
    
    const newProcessList = getNewProcesses(old.processList, fresh.processList);
    // tslint:disable-next-line:no-console
    console.info(`newProcessList`, newProcessList);

    expect(newProcessList.length).toBeLessThanOrEqual(2);
    expect(newProcessList.find(p => p.imageName === 'cmd.exe')).toBeTruthy();
    expect(newProcessList.find(p => p.imageName === 'tasklist.exe')).toBeTruthy();
  });
});

function execAsPromise(command: string): Promise<Array<Error|string>> {
  return new Promise<Array<Error|string>>((resolve, reject) =>
    exec(
      command,
      (error, stdout, stderr) => resolve([error, stdout, stderr])
    )
  );
}
