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
  private static bufferData: string = ''
  private static calendarData: CalendarData = {}

  public static scrapeCalendarData(): void {
    https.get(this.calendarURL, (res: any) => {
      res.setEncoding('utf8')
      res.on('data', (chunk: string) => {
        this.bufferData += chunk
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
    this.bufferData = this.bufferData
      .replace(/\r\n/gmi, ' ')
      .replace(/.*var calendar_data=/i, '')
      .replace(/(?<=;).*/i, '')
      .replace(';', '')

    try {
      JSON.parse(this.bufferData)
    } catch (err: unknown) {
      console.error(err);
      this.bufferData = '{}'
    }
  }

  // Removes duplicates from entries
  private static cleanCalendarData(): void {
    this.calendarData = JSON.parse(this.bufferData)
    Object.keys(this.calendarData).forEach(
      type => Object.keys(this.calendarData[type]).forEach(
        month => Object.keys(this.calendarData[type][month]).forEach(
          day => Object.keys(this.calendarData[type][month][day]).forEach(
            event => Object.keys(this.calendarData[type][month][day][event]).forEach(
              // Overwrite current array with one without duplicates
              id => this.calendarData[type][month][day][event][id] = Array.from(new Set(this.calendarData[type][month][day][event][id]))
            )
          )
        )
      )
    )
  }

  // If data was successfully formed, backs up the previous data file, then creates a new data file
  private static writeData(): void {
    if (Object.values(this.calendarData).length > 0) {
      fs.rename('./data/data.json', './data/data.old.json', (err: Error) => {
        if (err) console.error(err)
        fs.writeFileSync('./data/data.json', JSON.stringify(this.calendarData), 'utf8')
      })
    }
  }
}

module.exports = AutoScraper
