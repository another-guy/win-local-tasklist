import { IProcessInfo } from './process-info';

export function getNewProcesses(
  earlierProcessList: IProcessInfo[],
  laterProcessList: IProcessInfo[]
): IProcessInfo[] {
  return laterProcessList.filter(freshProcess =>
    earlierProcessList.every(oldProcess => freshProcess.pid !== oldProcess.pid)
  );
}
