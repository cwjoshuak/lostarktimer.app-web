<p align="center">
<img src="./public/images/LA_Mokko_Seed.png" alt="Lost Ark Timer" width="125" height="125"><br>
Timers for Lost Ark bosses, islands, events, wandering merchants and more!
<br>Never miss an event again.<br><br>
</p>

# LostArkTimer.app Website

- [Website](https://www.lostarktimer.app/)

## Features

- Event Timers (Islands, Bosses, Special Events)
- Wandering Merchants (powered by [Saintbot](http://saint-bot.webflow.io))
- 6 Alert Sounds
- Ability to disable alarms (once, 12 hours, or "permanently" [currently 3 weeks])
- Ability to hide disabled alarms
- Show less repeating events like the Grand Prix

Planned:

- Daily Reset countdown
- Procyon compass checkboxes
- Wandering Merchant Ships
- Dark / Light mode toggle

## Contribution

Contributors are highly welcome!

Join the [Discord](https://discord.gg/beFb23WgNC) to provide feedback, suggest features, and report bugs.

### Development

```sh
$ npm install
$ npm run dev
```

Note:
The merchants feature will not work in development until I figure out how to mock a websocket server with running data for development.

### Libraries

This project is styled with [tailwindcss](https://tailwindcss.com) and [daisyUI](https://daisyui.com).

## Deployment

This application is hosted on Vercel.

## License

GNU GPLv3
