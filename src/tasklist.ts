import { ChildProcess, exec } from 'child_process';

import { ITasklistResult } from './tasklist-result';

export const ctx = {
  exec: (command: string, callback?: ((error: Error | null, stdout: string, stderr: string) => void) | undefined) => exec(command, callback)
};

export function tasklist(): Promise<ITasklistResult> {
  return new Promise((resolve, reject) => {
    const _ = ctx.exec(`tasklist`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }

      if (stderr.length > 0) {
        reject(stderr);
      }

      try {
        const sections = getTasklistOutputSections(stdout);

        const columnLengthList = getColumnLengths(sections.delimeterLine);
        const columnHeaderList = getColumnHeaders(
          sections.headerLine,
          columnLengthList
        );
        const taskListResult = getTaskList(
          sections.processLineList,
          columnLengthList,
          columnHeaderList
        );

        resolve(taskListResult);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

export function getTasklistOutputSections(
  stdout: string
): { headerLine: string; delimeterLine: string; processLineList: string[] } {
  const lineList = stdout.split('\n');
  let currentLineIndex = 0;

  let headerLine: string = '';
  while (currentLineIndex < lineList.length) {
    const currentLine = lineList[currentLineIndex].trim();
    if (currentLine.length > 0) {
      headerLine = currentLine;
      currentLineIndex++;
      break;
    }
    currentLineIndex++;
  }

  let delimeterLine: string = '';
  while (currentLineIndex < lineList.length) {
    const currentLine = lineList[currentLineIndex];
    if (currentLine.length > 0 && currentLine[0] === '=') {
      delimeterLine = currentLine.trim();
      currentLineIndex++;
      break;
    }
    currentLineIndex++;
  }

  const processLineList = lineList
    .slice(currentLineIndex, lineList.length)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return { headerLine, delimeterLine, processLineList };
}

export function getColumnLengths(delimeterLine: string): number[] {
  const delimeterLineCharacterList = delimeterLine.split('');
  const columnLengthList: number[] = [];
  let currentLength = 0;
  for (const character of delimeterLineCharacterList) {
    switch (character) {
      case '=':
        currentLength += 1;
        break;
      case ' ':
        columnLengthList.push(currentLength);
        currentLength = 0;
        break;
      default:
        throw new Error(`Did not expect to observe '${character}'.`);
    }
  }
  if (currentLength > 0) {
    columnLengthList.push(currentLength);
  }
  return columnLengthList;
}

export function getColumnHeaders(
  headerLine: string,
  columnLengthList: number[]
): string[] {
  return orderedParts(headerLine, columnLengthList);
}

export function getTaskList(
  processLineList: string[],
  columnLengthList: number[],
  columnHeaderList: string[]
): ITasklistResult {
  const imageNameIndex = columnHeaderList.indexOf('Image Name');
  const pidIndex = columnHeaderList.indexOf('PID');
  const sessionNameIndex = columnHeaderList.indexOf('Session Name');
  const sessionNumberIndex = columnHeaderList.indexOf('Session#');
  const memUsageIndex = columnHeaderList.indexOf('Mem Usage');

  const processList = processLineList
    .map(line => {
      const lineCellList = orderedParts(line, columnLengthList);
      return {
        imageName: lineCellList[imageNameIndex],
        pid: Number.parseInt(lineCellList[pidIndex]),
        sessionName: lineCellList[sessionNameIndex],
        sessionNumber: Number.parseInt(lineCellList[sessionNumberIndex]),
        memUsage: lineCellList[memUsageIndex],
      };
    })
    .sort((process1, process2) => process1.pid - process2.pid);

  return { processList };
}

export function orderedParts(
  line: string,
  columnLengthList: number[]
): string[] {
  const columnLengthListCopy = [...columnLengthList];
  const columnHeaderList: string[] = [];
  while (line.length) {
    const columnLength = columnLengthListCopy.shift();
    if (columnLength == null) {
      throw new Error(`columnLength can not be ${columnLength}.`);
    }

    const header = line.substring(0, columnLength);
    columnHeaderList.push(header.trim());

    line = line.substring(columnLength + 1, line.length);
  }
  return columnHeaderList;
}
