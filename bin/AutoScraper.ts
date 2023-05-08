const fs = require('fs');
const https = require('https');

interface CalendarData {
  [key: string]: {
    [month: string]: {
      [day: string]: {
        [eventNo: string]: {
          [eventId: string]: string[]
        }
      }
    }
  }
}

export class AutoScraper {
  private static readonly calendarURL: string = 'https://lostarkcodex.com/us/eventcalendar/';
  private static buffer_data: string = '';
  private static calendar_data: CalendarData = {};

  public static scrapeCalendarData() {
    https.get(this.calendarURL, (res: any) => {
      res.setEncoding('utf8');
      res.on('data', (chunk: string) => {
        this.buffer_data += chunk;
      });
      res.on('end', () => {
        this.extractCalendarData();
        this.cleanCalendarData();
        this.writeData();
      });
    });
  }

  // Strip everything except the calendar_data variable
  private static extractCalendarData() {
    this.buffer_data = this.buffer_data
    .replace(/\r\n/gmi, ' ')
    .replace(/.*var calendar_data=/i, '')
    .replace(/(?<=;).*/i, '')
    .replace(';', '');
  }

  // Removes duplicates from entries
  private static cleanCalendarData() {
    this.calendar_data = JSON.parse(this.buffer_data);
    Object.keys(this.calendar_data).forEach(
      key => Object.keys(this.calendar_data[key]).forEach(
        month => Object.keys(this.calendar_data[key][month]).forEach(
          day => Object.keys(this.calendar_data[key][month][day]).forEach(
            event => Object.keys(this.calendar_data[key][month][day][event]).map(
              id => this.calendar_data[key][month][day][event][id] = Array.from(new Set(this.calendar_data[key][month][day][event][id]))
            )
          )
        )
      )
    )
  }

  private static writeData() {
    fs.writeFileSync('./data/data.json', JSON.stringify(this.calendar_data), 'utf8');
  }
}

module.exports = AutoScraper;
