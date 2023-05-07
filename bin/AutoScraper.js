"use strict";
exports.__esModule = true;
exports.AutoScraper = void 0;
var fs_1 = require("fs");
var https_1 = require("https");
var AutoScraper = /** @class */ (function () {
    function AutoScraper() {
    }
    AutoScraper.scrapeCalendarData = function () {
        var _this = this;
        (0, https_1.get)(this.calendarURL, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                _this.buffer_data += chunk;
            });
        });
        this.parseCalendarData();
    };
    AutoScraper.writeData = function () {
        (0, fs_1.writeFileSync)('./data/data.json', JSON.stringify(this.calendar_data), 'utf8');
    };
    AutoScraper.parseCalendarData = function () {
        this.buffer_data = this.buffer_data.replace(/\r?\n/gmi, ' ');
        this.calendar_data = this.buffer_data.replace(/.*var calendar_data=/i, '').replace(/(?<=;).*/i, '').replace(';', '');
        this.writeData();
    };
    AutoScraper.calendarURL = 'https://lostarkcodex.com/us/eventcalendar/';
    AutoScraper.buffer_data = '';
    AutoScraper.calendar_data = '';
    return AutoScraper;
}());
exports.AutoScraper = AutoScraper;
module.exports = AutoScraper;
