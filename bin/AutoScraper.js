"use strict";
exports.__esModule = true;
exports.AutoScraper = void 0;
var fs = require('fs');
var https = require('https');
var AutoScraper = /** @class */ (function () {
    function AutoScraper() {
    }
    AutoScraper.scrapeCalendarData = function () {
        var _this = this;
        https.get(this.calendarURL, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                _this.buffer_data += chunk;
            });
            res.on('end', function () {
                _this.extractCalendarData();
                _this.cleanCalendarData();
                _this.writeData();
            });
        });
    };
    // Strip everything except the calendar_data variable
    AutoScraper.extractCalendarData = function () {
        this.buffer_data = this.buffer_data
            .replace(/\r\n/gmi, ' ')
            .replace(/.*var calendar_data=/i, '')
            .replace(/(?<=;).*/i, '')
            .replace(';', '');
    };
    // Removes duplicates from entries
    AutoScraper.cleanCalendarData = function () {
        var _this = this;
        this.calendar_data = JSON.parse(this.buffer_data);
        Object.keys(this.calendar_data).forEach(function (key) { return Object.keys(_this.calendar_data[key]).forEach(function (month) { return Object.keys(_this.calendar_data[key][month]).forEach(function (day) { return Object.keys(_this.calendar_data[key][month][day]).forEach(function (event) { return Object.keys(_this.calendar_data[key][month][day][event]).map(function (id) { return _this.calendar_data[key][month][day][event][id] = Array.from(new Set(_this.calendar_data[key][month][day][event][id])); }); }); }); }); });
    };
    AutoScraper.writeData = function () {
        fs.writeFileSync('./data/data.json', JSON.stringify(this.calendar_data), 'utf8');
    };
    AutoScraper.calendarURL = 'https://lostarkcodex.com/us/eventcalendar/';
    AutoScraper.buffer_data = '';
    AutoScraper.calendar_data = {};
    return AutoScraper;
}());
exports.AutoScraper = AutoScraper;
module.exports = AutoScraper;
