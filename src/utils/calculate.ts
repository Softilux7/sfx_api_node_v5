export function getTimeService(dateIni: string, dateFim: string): number {
    const dateIniDiff = new Date(dateIni);
    const dateFimDiff = new Date(dateFim);
  
    const diffInMilliseconds = dateFimDiff.getTime() - dateIniDiff.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  
    return diffInMinutes;
  }
  