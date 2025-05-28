function toDevanagari(number) {
	if (!number) return null;
	const map = ['०','१','२','३','४','५','६','७','८','९'];
	return number.toString().split('').map(d => map[parseInt(d)]).join('');
}

function formatBSDate(bsYear, bsMonth, bsDay, format = 'YYYY-MM-DD', locale = 'en') {
  const year = locale === 'ne' ? toDevanagari(bsYear) : bsYear;
  const month = locale === 'ne' ? toDevanagari(bsMonth) : bsMonth;
  const day = locale === 'ne' ? toDevanagari(bsDay) : bsDay;
  return format.replace('YYYY', year).replace('MM', month.toString().padStart(2, 0)).replace('DD', day.toString().padStart(2, 0));
}

function adToBs(adDate, bsData) {
  const ad = new Date(adDate);
  for (const yearData of bsData) {
    const start = new Date(yearData.startDate);
    let dayCount = 0;
    for (let m = 0; m < 12; m++) {
      const days = yearData.months[m];
      for (let d = 1; d <= days; d++) {
        const temp = new Date(start.getTime() + dayCount * 86400000);
        if (temp.toDateString() === ad.toDateString()) {
          return { bsYear: yearData.bsYear, bsMonth: m + 1, bsDay: d };
        }
        dayCount++;
      }
    }
  }
  return null;
}

function bsToAd(bsYear, bsMonthIndex, bsDay, bsData) {
  const yearData = bsData.find(y => y.bsYear === bsYear);
  const base = new Date(yearData.startDate);
  const daysOffset = yearData.months.slice(0, bsMonthIndex).reduce((a,b)=>a+b, 0) + bsDay - 1;
  return new Date(base.getTime() + daysOffset * 86400000);
}
