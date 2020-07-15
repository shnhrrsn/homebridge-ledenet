# homebridge-ledenet

[![Latest Version](https://img.shields.io/npm/v/homebridge-ledenet.svg)](https://www.npmjs.com/package/homebridge-ledenet)
[![Total Downloads](https://img.shields.io/npm/dt/homebridge-ledenet.svg)](https://www.npmjs.com/package/homebridge-ledenet)
[![Build Status](https://cloud.drone.io/api/badges/shnhrrsn/homebridge-ledenet/status.svg)](https://cloud.drone.io/shnhrrsn/homebridge-ledenet)
[![License](https://img.shields.io/npm/l/homebridge-ledenet.svg)](https://www.npmjs.com/package/homebridge-ledenet)

WIP homebride platform for LEDENET devices (MagcHome) with full support for RGB+CCT/WWCW.

## Devices

The following devices have been tested and confirmed to work:

- [LEDENET Smart WiFi LED Controller 5 Channels Control 4A5CH](https://www.amazon.com/gp/product/B01DY56N8U/)

## Status

Seems to work fully for RGB and CCT using both WW/CW LEDs.

TODO:

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
