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
        try {
            JSON.parse(this.buffer_data);
        }
        catch (e) {
            this.buffer_data = '{}';
        }
    };
    // Removes duplicates from entries
    AutoScraper.cleanCalendarData = function () {
        var _this = this;
        this.calendar_data = JSON.parse(this.buffer_data);
        Object.keys(this.calendar_data).forEach(function (type) { return Object.keys(_this.calendar_data[type]).forEach(function (month) { return Object.keys(_this.calendar_data[type][month]).forEach(function (day) { return Object.keys(_this.calendar_data[type][month][day]).forEach(function (event) { return Object.keys(_this.calendar_data[type][month][day][event]).forEach(
        // Overwrite current array with one without duplicates
        function (id) { return _this.calendar_data[type][month][day][event][id] = Array.from(new Set(_this.calendar_data[type][month][day][event][id])); }); }); }); }); });
    };
    // Backs up the previous data file, then replaces it
    AutoScraper.writeData = function () {
        fs.renameSync('./data/data.json', './data/data.old.json');
        fs.writeFileSync('./data/data.json', JSON.stringify(this.calendar_data), 'utf8');
    };
    AutoScraper.calendarURL = 'https://lostarkcodex.com/us/eventcalendar/';
    AutoScraper.buffer_data = '';
    AutoScraper.calendar_data = {};
    return AutoScraper;
}());
exports.AutoScraper = AutoScraper;
module.exports = AutoScraper;
