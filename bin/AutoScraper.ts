import { writeFileSync } from 'fs';
import { get } from 'https';

export class AutoScraper {
  private static readonly calendarURL: string = 'https://lostarkcodex.com/us/eventcalendar/';
  private static buffer_data: string = '';
  private static calendar_data: string = '';

  public static scrapeCalendarData() {
    get(this.calendarURL, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        this.buffer_data += chunk;
      });
    });

    this.parseCalendarData();
  }

  private static writeData(){
    writeFileSync('./data/data.json', JSON.stringify(this.calendar_data), 'utf8');
  }

  private static parseCalendarData(){
    this.buffer_data = this.buffer_data.replace(/\r?\n/gmi, ' ');
    this.calendar_data = this.buffer_data.replace(/.*var calendar_data=/i, '').replace(/(?<=;).*/i, '').replace(';', '');
    this.writeData();
  }
}

module.exports = AutoScraper;
