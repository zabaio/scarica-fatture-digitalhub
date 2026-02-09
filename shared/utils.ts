import dayjs from 'dayjs';
import path from 'path';

export const DOWNLOAD_DIR = path.join(process.cwd(), "data", "downloads");
export const CONFIG_PATH = path.join(process.cwd(), "config", "config.json");

//Utility formatting
export function formatDMY(date: dayjs.Dayjs){ return date.format('DD-MM-YYYY'); }
export function formatYMD(date: dayjs.Dayjs){ return date.format('YYYY-MM-DD'); }

export function formatArchiveFilename(ces: string, start: dayjs.Dayjs, end: dayjs.Dayjs, cur: dayjs.Dayjs){
  return "EXP_" + ces + "_" + formatYMD(start) + "_" + formatYMD(end) + "_" + cur.format('YYYY-MM-DD[T]HH-mm-ss') + ".zip";
}