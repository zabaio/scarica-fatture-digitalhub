import dayjs from 'dayjs';

//Utility formatting
export function formatDMY(date: dayjs.Dayjs){ return date.format('DD-MM-YYYY'); }
export function formatYMD(date: dayjs.Dayjs){ return date.format('YYYY-MM-DD'); }

export function formatArchiveFilename(ces: string, start: dayjs.Dayjs, end: dayjs.Dayjs, cur: dayjs.Dayjs){
  return "EXP_" + ces + "_" + formatYMD(start) + "_" + formatYMD(end) + "_" + cur.format('YYYY-MM-DD[T]HH-mm-ss') + ".zip";
}