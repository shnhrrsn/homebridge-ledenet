# homebridge-ledenet

[![Latest Version](https://img.shields.io/npm/v/homebridge-ledenet.svg)](https://www.npmjs.com/package/homebridge-ledenet)
[![Total Downloads](https://img.shields.io/npm/dt/homebridge-ledenet.svg)](https://www.npmjs.com/package/homebridge-ledenet)
[![License](https://img.shields.io/npm/l/homebridge-ledenet.svg)](https://www.npmjs.com/package/homebridge-ledenet)

**WIP** homebride platform for LEDENET devices (MagcHome) with full support for RGB+CCT/WWCW.

## Devices

The following devices have been tested and confirmed to work:

- [LEDENET Smart WiFi LED Controller 5 Channels Control 4A5CH](https://www.amazon.com/gp/product/B01DY56N8U/)

## Installation

1. [Homebridge](https://github.com/nfarina/homebridge)
2. `npm i -g homebridge-ledenet`
3. Add platform to your config file

## Configuration

In order to use this plugin, you’ll need to add the following JSON object to your Homebridge config file:

```json
{
  "platform": "ledenet",
  "name": "ledenet",
  "accessories": [
    {
      "name": "lightstrip",
      "ip": "10.0.1.100"
    }
  ]
}
```

| Config Key    | Description                                                                                                            | Required |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- | -------- |
| `platform`    | Homebridge Platform name.<br>This value should always be ledenet.                                                      | Y        |
| `name`        | The name of this platform within Homebridge.<br>This is mainly used for logs and can be any value you want.            | N        |
| `accessories` | List of LEDENet devies this plugin should expose.<br>See the [Accessories](#accessories) section for more information. | Y        |

### Accessories

The accessories config object allows you to customize how your devices appear and behave within HomeKit.

```json
{
  "platform": "ledenet",
  "name": "ledenet",
  "accessories": [
    {
      "name": "lightstrip",
      "ip": "10.0.1.100",
      "cct": {
        "warmTemp": 3000,
        "coolTemp": 6000
      }
    }
  ]
}
```

| Config Key     | Description                                                     |
| -------------- | --------------------------------------------------------------- |
| `name`         | The default name this accessory should have in HomeKit.         |
| `ip`           | The IP address of the controller.                               |
| `cct`          |                                                                 |
| `cct.warmTemp` | The color temperature of your warm white LED. Defaults to 3000. |
| `cct.coolTemp` | The color temperature of your cool white LED. Defaults to 6000. |

## Status

Seems to work fully for RGB and CCT using both WW/CW LEDs.

#### TODO:

- Need to support auto-switching to CCT when RGB values get into white ranges
- Support other devices:
  - RGB
  - RGBW
  - WWCW

## Development

Running Homebridge with this plugin:

```bash
yarn testharness
```

Inspecting packets between the MagicHome app and the device to reverse engineer the LEDENET protocol:

```bash
yarn util proxy-discovery # This allows the MagicHome app to detect your computer as a device
yarn util proxy-cmds # This proxies commands between your compiter and your LEDENET device
```
