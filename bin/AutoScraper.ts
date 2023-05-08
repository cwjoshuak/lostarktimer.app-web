const fs = require('fs')
const https = require('https')

interface CalendarData {
  [type: string]: {
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
  private static readonly calendarURL: string = 'https://lostarkcodex.com/us/eventcalendar/'
  private static buffer_data: string = ''
  private static calendar_data: CalendarData = {}

  public static scrapeCalendarData(): void {
    https.get(this.calendarURL, (res: any) => {
      res.setEncoding('utf8')
      res.on('data', (chunk: string) => {
        this.buffer_data += chunk
      })
      res.on('end', () => {
        this.extractCalendarData()
        this.cleanCalendarData()
        this.writeData()
      })
    })
  }

  // Strip everything except the calendar_data variable
  private static extractCalendarData(): void {
    this.buffer_data = this.buffer_data
      .replace(/\r\n/gmi, ' ')
      .replace(/.*var calendar_data=/i, '')
      .replace(/(?<=;).*/i, '')
      .replace(';', '')

    try {
      JSON.parse(this.buffer_data)
    } catch (err: unknown) {
      console.error(err);
      this.buffer_data = '{}'
    }
  }

  // Removes duplicates from entries
  private static cleanCalendarData(): void {
    this.calendar_data = JSON.parse(this.buffer_data)
    Object.keys(this.calendar_data).forEach(
      type => Object.keys(this.calendar_data[type]).forEach(
        month => Object.keys(this.calendar_data[type][month]).forEach(
          day => Object.keys(this.calendar_data[type][month][day]).forEach(
            event => Object.keys(this.calendar_data[type][month][day][event]).forEach(
              // Overwrite current array with one without duplicates
              id => this.calendar_data[type][month][day][event][id] = Array.from(new Set(this.calendar_data[type][month][day][event][id]))
            )
          )
        )
      )
    )
  }

  // If data was successfully formed, backs up the previous data file, then creates a new data file
  private static writeData(): void {
    if (Object.values(this.calendar_data) !== Object.values({})) {
      fs.renameSync('./data/data.json', './data/data.old.json')
      fs.writeFileSync('./data/data.json', JSON.stringify(this.calendar_data), 'utf8')
    }
  }
}

module.exports = AutoScraper
