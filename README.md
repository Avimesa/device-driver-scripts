# Avimesa Device Driver Scripts
*last updated 2019-Jan-2*

This project contains example Device Driver Scripts and Configurations to be used with the Avimesa Device Cloud.  The engine is based on JerryScript (http://jerryscript.net) and runs server side instead of device side.  Thanks to Tillman Scheller for JerryScript.

<a id="toc"></a>
## Table of Contents
- [1. Getting Started](#1.-getting-started)
- [2. Prerequisites](#2.-prerequisites)
- [3. Device Driver Engine Overview](#3.-device-driver-engine-overview)
    - [3.1 Summary](#3.1-summary)
    - [3.2 Process Model](#3.2-process-model)
- [4. Native Functions](#4.-native-functions)
    - [4.1 avmsaGetEpochTime](#4.1-avmsaGetEpochTime)
    - [4.2 avmsaSendToRawQueue](#4.2-avmsaSendToRawQueue)
    - [4.3 avmsaSendToNotificationQueue](#4.3-avmsaSendToNotificationQueue)
    - [4.4 avmsaGetNextActuationMsg](#4.4-avmsaGetNextActuationMsg)
    - [4.5 avmsaWriteFile](#4.5-avmsaWriteFile)
    - [4.6 avmsaReadFile](#4.6-avmsaReadFile)
    - [4.7 avmsaGetFiles](#4.7-avmsaGetFiles)
    - [4.8 avmsaSetStatusMsg](#4.8-avmsaSetStatusMsg)
- [5. Quick Start Examples](#5.-quick-start-examples)
    - [01-the-bare-minimum](#01-the-bare-minimum)
    - [02-alarms-and-notifications](#02-alarms-and-notifications)
    - [03-using-a-file-for-session-state](#03-using-a-file-for-session-state)
    - [04-the-dialtone-object](#04-the-dialtone-object)
        - [root](#04-the-dialtone-object-root)
        - [dev](#04-the-dialtone-object-dev)
        - [dev_cfg](#the-dialtone-object-dev-cfg)
        - [dev_data](#the-dialtone-object-dev-data)
        - [dev_cmd](#04-the-dialtone-object-dev-cmd)
        - [chans](#04-the-dialtone-object-dev-chans)
        - [chans-ch_cfg](#04-the-dialtone-object-dev-chans-ch-cfg)
        - [chans-ch_data](#04-the-dialtone-object-dev-chans-ch-data)
    - [05-device-config-avimesa-1000](#05-device-config-avimesa-1000)
- [Appendix A - Units](#a.-units)



[Top](#toc)<br> 
<a id="1.-getting-started"></a>
## 1. Getting Started

The following scripts can be downloaded and used as is or as a starting point to build custom scripts.




[Top](#toc)<br>
<a id="2.-prerequisites"></a>
## 2. Prerequisites

- Avimesa Device Cloud credentials
- The Avimesa Toolkit (https://toolkit.avimesa.com)
- An Avimesa Device (or simulator)





[Top](#toc)<br>
<a id="3.-device-driver-engine-overview"></a>
## 3. Device Driver Engine Overview

<a id="3.1-summary"></a>
#### 3.1 Summary

```                                                

/-------------------------------- Avimesa Device Cloud -------------------\ /-------- Client ---------\

                   B                            C1                           D
                 +---------------------.       +-------------------------.     
                 |Device Driver Engine | ----> | Raw (raw_q)             |   
                 |                     |       |_________________________|
A                | +-------------.     |       C2
+------.         | | Script      |     |       +-------------------------.     Client Application using
|Device| <-----> | |_____________|     | ----> | Notification (not_q)    |         the Avimesa API
|______|         |                     |       |_________________________|
                 | +------------.      |       C3
                 | | Config     |      |       +~~~~~~~~~~~~~~~~~~~~~~~~~.
                 | |____________|      | <---- | Actuation ('device id') |
                 |_____________________|       |~~~~~~~~~~~~~~~~~~~~~~~~~|
                   
```
The Device (`A`) communicates through the Avimesa Device Cloud and the Device Driver Engine (`B`) executes a `Script` and configures a device with a `Config`.  The whole interaction executes in a containerized environment for the device within the Device Cloud.

The `Script` is an ECMA 5.1 compliant JavaScript with additional Avimesa Device Cloud native functions covered in later sections.

The `Script` has access to the Device's data, and can write device state to the Raw (`C1`) or Notification queues (`C2`).  The `Script` can also read from the Device's Actuation queue (`C3`).

The `Script` has access to the Device's configuration for dynamic updates, otherwise the static version will be used to configure the device.

Client applications can access the Avimesa Device Cloud via the Avimesa API (`D`), which presently supports an AMQP 0-9-1 interface (e.g. RabbitMQ based broker).

The Avimesa API is used to upload `Scripts` and `Configs` to devices.

<a id="3.2-process-model"></a>
#### 3.2 Process Model 

A device connection will invoke the Device Driver Engine.  There is no session between transactions and are to be considered atomic in nature, with the exception of using the file access built in functions.






[Top](#toc)<br>
<a id="4.-native-functions"></a>
## 4. Native Functions

<a id="4.1.-avmsaGetEpochTime"></a>
#### 4.1 avmsaGetEpochTime

Gets the current Linux Time.

```
var timestamp = avmsaGetEpochTime();
```

<a id="4.2.-avmsaSendToRawQueue"></a>
#### 4.2 avmsaSendToRawQueue

Sends the device input data (`dev_in`) to the raw queue.

```
avmsaSendToRawQueue();
```

<a id="4.3.-avmsaSendToNotificationQueue"></a>
#### 4.3 avmsaSendToNotificationQueue

Sends the device input data (`dev_in`) to the notification queue.

```
avmsaSendToNotificationQueue();
```

<a id="4.4.-avmsaGetNextActuationMsg"></a>
#### 4.4 avmsaGetNextActuationMsg 

Gets the next available pending actuation message for the device, if any (FIFO buffer).

```
var oldestMsg = avmsaGetNextActuationMsg();
```

<a id="4.5.-avmsaWriteFile"></a>
#### 4.5 avmsaWriteFile 

Writes a file to the device’s container.

```
avmsaWriteFile(object, file_name, expiry_secs);
```

<a id="4.6.-avmsaReadFile"></a>
#### 4.6 avmsaReadFile 

Read a file from the device’s container.

```
var jsonObject = avmsaReadFile(file_name);
```


<a id="4.7.avmsaGetFiles-"></a>
#### 4.7 avmsaGetFiles

Get files from the device’s container.

```
var files = avmsaGetFiles();
```

<a id="4.8.-avmsaSetStatusMsg"></a>
#### 4.8 avmsaSetStatusMsg

Sets a status message (64 char limit) to report to the system log queue.

```
avmsaSetStatusMsg("Small debug message");
```





[Top](#toc)<br>
<a id="5.-quick-start-examples"></a>
## 5. Quick Start Examples

<a id="01-the-bare-minimum"></a>
### 01-the-bare-minimum

This example is available in the '01-the-bare-minimum' directory and contains, as you might gather from the name, the bare minimum required to do something useful.

```
function avmsaMain(){

    // Send the 'dev_in' data to the raw queue
    avmsaSendToRawQueue();

    // Get the next actuation messsge (if any) and send to device
    dev_out.actuation = avmsaGetNextActuationMsg();
}
```

The entry point of the script is `avmsaMain()`.  We immediately send the device's data along to the raw queue using `avmsaSendToRawQueue()`, which sends the `dev_in` JSON object 'as-is' to the raw queue (accessed via the API's `raw_q`).  

Then, we grab the 'next' actuation message for the device (if any) using the `avmsaSendToRawQueue()`.  We set the response of this function call to the `dev_out.actuation` field to pass the actuation command 'as-is' to the device.

[Top](#toc)<br>
<a id="02-alarms-and-notifications"></a>
### 02-alarms-and-notifications

This example, available in the '02-alarms-and-notifications' directory, shows how one could inspect the device's data and trigger an alarm condition.  To distinguish 'normal' data from 'higher priority' data, the notification queue is used (accessed via the API's `not_q`).

The `dev_in` object here is from an Avimesa 1000, which is a seven channel device that, at its core, measures amperage readings from 4-20mA sensors.  The `dev_in` object is further described in the XX-device-input-object example.

```
function avmsaMain(){
    var alarm = false;

    var ALARM_VALUE_0 = 0.010;
    var ALARM_VALUE_1 = 0.015;

    if (dev_in.dev.chans[0].ch_data[0].val > ALARM_VALUE_0){
        alarm = true;
    }
    else if (dev_in.dev.chans[1].ch_data[0].val > ALARM_VALUE_1){
        alarm = true;
    }

    if (alarm){
        avmsaSendToNotificationQueue();
    }
}
```

The above will only send along the device's data to the notification queue if a condition is met that is deemed an alarm (in this case, channel 0's value is larger than 10mA or channel 1's is larger than 15mA).

[Top](#toc)<br>
<a id="03-using-a-file-for-session-state"></a>
### 03-using-a-file-for-session-state

This example, available in the '03-using-a-file-for-session-state' directory, shows how to use a file to keep a session state across device transactions.

This test script was used for a garage door sensor hack that was used during long term testing for the Avimesa 1000.  It utilized a GP1A57HRJ00F photo interrupter (https://www.sparkfun.com/products/9299).  

Basically, when the door was shut the sensor outputs roughly 0.2 mA, and then the door is open the sensor would output roughly 0.0 mA.

The Avimesa 1000 was powered with 5.0 VDC (which is valid...), and the sensor was connected to channel 0.

At first, all readings were being sent to the raw queue.  This created a LOT of data that isn't necessary.  So, with a simple script, we can only send data when there's a change (e.g. when the door is opened or shut).

```
function avmsaMain(){
    // some value to trigger a condition
    var TRIGGER_VALUE = 0.0001;

    var currentState = {};
    currentState.open = 0;

    // attempt to load last state from disk
    var lastState = avmsaReadFile('lastState');

    // if not defined, force an update
    if (!lastState){
        lastState = {};
        lastState.open = -1;
    }

    // Evaluate input data
    if (dev_in.dev.chans[0].ch_data[0].val < TRIGGER_VALUE){
        currentState.open = 1;
    }

    // If there was a state change, send the data to the raw queue
    if (currentState.open != lastState.open){
        avmsaSendToRawQueue();
    }

    // Save to disk
    avmsaWriteFile(currentState, 'lastState', 86400);
}
```

The script above simply loads the last state from disk and if there's a change in state, sends the data to the raw queue.


[Top](#toc)<br>
<a id="04-the-dialtone-object"></a>
### 04-the-dialtone-object

The DialTone object is a JSON object used to represent device state, data, configuration and commands.  An example of this object is in the '04-the-dialtone-object' directory.

It is intended to offer a dynamic, scalable, cross industry data model.  At a high level, it consists of a device which can contain device data and device configuration, provide the ability to support N “channels”, which are used to provide varied data types and configurations.  Also supported is the idea of commands that can be used to invoke processes.


[Top](#toc)<br>
<a id="04-the-dialtone-object-root"></a>
#### (root object)

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `api_maj` | Number, uint32 | Yes | API Version Major |
| `api_min` | Number, uint32 | Yes |  API Version Minor |
| `dts` | Number, uint32 | Yes |  Epoch/Unix Time, approximate date time.  This is set upon deserialization in Device Cloud upon receipt. |
| `dev`| Object| No | See `dev` section below |


[Top](#toc)<br>
<a id="04-the-dialtone-object-dev"></a>
#### dev

The Device node, access via `dev`.  It is not required but typically present.

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `dev_id` | String | Yes | Device ID, UUID without hypens, lowercase |
| `dev_cfg`| Object| No | See `dev_cfg` section below |
| `dev_data`| Object| No | See `dev_data` section below |
| `dev_cmd`| Object| No | See `dev_cmd` section below |
| `chans`| Object| No | See `chans` section below |



[Top](#toc)<br>
<a id="the-dialtone-object-dev-cfg"></a>
#### dev_cfg

The Device Configuration node, accessed through `dev.dev_cfg`.  It is not required, but typically present in files like the `Config` file used by the Device Driver engine.

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `heartbeat ` | Number, uint32 | Yes | In general, this parameter informs the device how long to sleep between measurements in seconds.  Valid range is 0-43200 |



[Top](#toc)<br>
<a id="the-dialtone-object-dev-data"></a>
#### dev_data

The Device Data node, accessed through `dev.dev_data`.  It is not required, but typically present in the `dev_in` object that is accesible in the Device Driver Engine runtime.

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `dev_type ` | Number, uint32 | Yes | - 0x0000 - Unknown <br/> - 0x0100 - Avimessa 10000 |
| `fw ` | Number, uint32 | Yes | Firmware revision, maj.min.build, where maj = 8 most significant bit, minor = next 8 bits, build = next 16 bits |
| `hw_rev ` | Number, uint32 | Yes | Hardware revision, 4 bytes for 4 ASCII chars |
| `bat ` | Number, float (single precision) | Yes | Power supply voltage (DC) |
| `rssi ` | Number, int32 | Yes | NA |
| `tmep ` | Number, int32 | Yes | NA |
| `dev_sts  ` | Number, uint32 | Yes | Device Status Word (FUTURE USE) |



[Top](#toc)<br>
<a id="04-the-dialtone-object-dev-cmd"></a>
#### dev_cmd

The Device Command node, accessed through `dev.dev_cmd`.   It is not required, but typically present on JSON objects in the device's Actuation queue.

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `dev_cmd_id ` | Number, uint16 | Yes | See Commands |
| `req_id ` | Number, uint32 | Yes | Request ID provided by the API user, tracked through the system and given in a response for confirmation |
| PAYLOAD | Various | No | See Commands |



[Top](#toc)<br>
<a id="04-the-dialtone-object-dev-chans"></a>
#### chans

The Device's Channel(s) node, accessed through `dev.chans`.  It is not required, but typically present in both `Config` files and the `dev_in` object.

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `ch_idx ` | Number, uint32 | Yes | Channel Index (zero based) |
| `ch_cfg ` | Object | No | See `ch_cfg` |
| `ch_data ` | Object | No |See `ch_data` |



[Top](#toc)<br>
<a id="04-the-dialtone-object-dev-chans-ch-cfg"></a>
#### ch_cfg

The Channel Configuration, accessed through `dev.chans[i].ch_cfg`.  It is not required, but typically in the `Config` file.

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `ch_type ` | Number, uint32 | Yes | - 0x0000 - None <br/> - 0x0001 - 4-20 mA Sensor <br/> - 0x0100 - GPIO  |
| `en ` | Number, Boolean | Yes | 0 - disable measurement <br/> 1 - enable measurement |
| `sched ` | Number, uint32 | Yes | Measurement schedule, for future use.  Set to 1 for now.  |
| `sensor ` | Object | Yes | See `sensor` |



[Top](#toc)<br>
<a id="04-the-dialtone-object-dev-chans-ch-cfg-sensor"></a>
#### sensor

The Channel Sensor Configuration, accessed through `dev.chans[i].ch_cfg.sensor`.  It is not required for all channel types, but typically in the `Config` file.



[Top](#toc)<br>
<a id="04-the-dialtone-object-dev-chans-ch-cfg-sensor-420"></a>
##### 4-20 mA Sensor Settings

For 4-20 mA Sensor type channels.

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `settling_time ` | Number, float single | Yes | Settling time for the sensor in seconds after being powered on and data is acceptably settled.  Valid range of 0-60000.0  |


[Top](#toc)<br>
<a id="04-the-dialtone-object-dev-chans-ch-cfg-sensor-gpio"></a>
##### GPIO Sensor Flags

For GPIO type channels.

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `sens_flags ` | Number, uint16 | Yes | See below  |


Byte 0

| 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| n/a | n/a | n/a | n/a | Latching | Persistent | Default State | Mode |

Byte 1

| 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |


A 16 bit unsigned value containing status flags for a GPIO channel configuration.

A 'GPIO' means 'general purpose input or output'.  This means there's a "pin" on the board that we can set the voltage (0V or 3.3VDC) or we can detect if a voltage is "high" or "low"

Setting the MODE to 0 means make this pin an INPUT pin and read the physical value (either high or low) and we can tell the user if it's high or low (on or off)

If MODE is 0, the other bits are ignored as they aren't needed

Setting MODE to 1 means make it an OUTPUT, which means we will set the voltage programmatically (high or low, or 3.3VDC or 0VDC)

When the device boots up, we might need to set a default value for the pin, so the Default State bit says whether to boot up to high or low

The persistent bit means that, whatever the state is before a power cycle, upon boot up, set that state to whatever it was (so it will override the Default State in this case).

The Latching bit means that, if NOT set, when you set the GPIO pin it will go back to original state (e.g. a pulse).  If Latching bit is set, it will retain the value and not toggle.


[Top](#toc)<br>
<a id="04-the-dialtone-object-dev-chans-ch-data"></a>
#### ch_data

The Channel Data (array), accessed through `dev.chans[i].ch_data[j]`.  It is not required, but typically present in the `dev_in` object.

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `data_idx ` | Number, uint32 | Yes | Index of the datum for the channel |
| `units ` | Number, uint32 | Yes | See Units |
| `data_idx ` | Number, uint32 or float | Yes | Based upon unit type, either a floating point or uint32 value |


[Top](#toc)<br>
<a id="05-device-config-avimesa-1000"></a>
### 05-device-config-avimesa-1000

A Device can be configured by uploading a `Config` file using the Avimesa API.  The `Config` file is essentially the configuration portions available in the DialTone object described in the [04-the-dialtone-object](#04-the-dialtone-object) section.

The example configuration files do the following for an Avimesa 1000:

#### config1.json

- Take a measurement once an hour
- The analog 4-20 mA sensor channels 0-3 are enabled to take measurements, with settling times of 10.0, 5.0, 1.0 and 0.5 seconds respectively.
- The digital channels 8-9 are enabled as outputs without any other flags

#### config2.json

- Take measurements continuously on all analog 4-20 mA sensor channels
- Initially settle the channels for 10.0 seconds upon first power up
- Sensors will stay powered on with this configuration




[Top](#toc)<br> 
<a id="a.-units"></a>
## Appendix A - Units

| Name | Value (base 16) | Value (base 10) | Description |
| --- | --- | --- | --- |
| eAVI_ENG_UNIT_UNKNOWN | 0x0000 | 0 | Unknown unit type |
| --- | --- | --- | --- |
| eAVI_ENG_UNIT_AMPS_DC  | 0x0001 | 1 | Amperage, DC |
| eAVI_ENG_UNIT_AMPS_AC  | 0x0002 | 2 | Amperage, AC |
| eAVI_ENG_UNIT_VOLTS_DC | 0x0003 | 3 | Volts, DC |
| eAVI_ENG_UNIT_VOLTS_AC | 0x0004 | 4 | Volts, AC |
| --- | --- | --- | --- |
| eAVI_ENG_UNIT_C | 0x0010 | 16 | Temperature, Celsius |
| eAVI_ENG_UNIT_F | 0x0011 | 17 | Temperature, Fahrenheit |
| eAVI_ENG_UNIT_K | 0x0012 | 18 | Temperature, Kelvin |
| --- | --- | --- | --- |
| eAVI_ENG_UNIT_PSI   | 0x0020 | 32 | Pressure, pound-force per square inch |
| eAVI_ENG_UNIT_PA    | 0x0021 | 33 | Pressure, pascal |
| eAVI_ENG_UNIT_BAR   | 0x0022 | 34 | Pressure, bar |
| eAVI_ENG_UNIT_TORR  | 0x0023 | 35 | Pressure, torr |
| eAVI_ENG_UNIT_ATM   | 0x0024 | 36 | Pressure, atmosphere |
| eAVI_ENG_UNIT_PSID  | 0x0028 | 40 | Pressure, pound-force per square inch, differential |
| eAVI_ENG_UNIT_PAD   | 0x0029 | 41 | Pressure, pascal, differential |
| eAVI_ENG_UNIT_BARD  | 0x002A | 42 | Pressure, bar, differential |
| eAVI_ENG_UNIT_TORRD | 0x002B | 43 | Pressure, torr, differential |
| eAVI_ENG_UNIT_ATMD  | 0x002C | 44 | Pressure, atmosphere, differential |
| --- | --- | --- | --- |
| eAVI_ENG_UNIT_SEC | 0x0030 | 48 | Seconds |
| eAVI_ENG_UNIT_HZ  | 0x0031 | 49 | Hertz |
| eAVI_ENG_UNIT_CPM | 0x0032 | 50 | Cycles Per Minute |
| --- | --- | --- | --- |
| eAVI_ENG_UNIT_METERS          | 0x0040 | 64 | Meters |
| eAVI_ENG_UNIT_METER_PER_SEC   | 0x0041 | 65 | Meters Per Second |
| eAVI_ENG_UNIT_METER_PER_SEC2  | 0x0042 | 66 | Meters Per Second^2 |
| eAVI_ENG_UNIT_FEET            | 0x0043 | 67 | Feet |
| eAVI_ENG_UNIT_FEET_PER_SEC    | 0x0044 | 68 | Feet Per Second |
| eAVI_ENG_UNIT_FEET_PER_SEC2   | 0x0045 | 69 | Feet Per Second^2 |
| eAVI_ENG_UNIT_INCHES          | 0x0046 | 70 | Inches |
| eAVI_ENG_UNIT_INCHES_PER_SEC  | 0x0047 | 71 | Inches Per Second |
| eAVI_ENG_UNIT_INCHES_PER_SEC2 | 0x0048 | 72 | Inches Per Second^2 |
| eAVI_ENG_UNIT_INCHES          | 0x0049 | 73 | Yards |
| eAVI_ENG_UNIT_INCHES_PER_SEC  | 0x004A | 74 | Yards Per Second |
| eAVI_ENG_UNIT_INCHES_PER_SEC2 | 0x004B | 75 | Yards Per Second^2 |
| --- | --- | --- | --- |
| eAVI_ENG_UNIT_KILOGRAM | 0x0050 | 80 | Kilogram |
| --- | --- | --- | --- |
| eAVI_ENG_UNIT_NEWTON | 0x0060 | 96 | Newton |
| eAVI_ENG_UNIT_JOULE  | 0x0061 | 97 | Joule |
| eAVI_ENG_UNIT_WATT   | 0x0062 | 98 |  Watt |
| --- | --- | --- | --- |
| eAVI_ENG_UNIT_LPM | 0x0070 | 112 | Liter Per Minute |
| eAVI_ENG_UNIT_GPM | 0x0071 | 113 | Gallon Per Minute |
| --- | --- | --- | --- |
| eAVI_ENG_UNIT_CUBIC_METER | 0x0080 | 128 | Cubic Meter |
| --- | --- | --- | --- |
| eAVI_ENG_UNIT_IPS_PK     | 0x0100 | 256 | Inches Per Second, Peak |
| eAVI_ENG_UNIT_IPS_RMS    | 0x0101 | 257 | Inches Per Second, RMS |
| eAVI_ENG_UNIT_MMS_PK     | 0x0102 | 258 | mm/s, Peak |
| eAVI_ENG_UNIT_MMS_RMS    | 0x0103 | 259 | mm/s, RMS |
| eAVI_ENG_UNIT_G_RMS      | 0x0104 | 260 | g, Peak |
| eAVI_ENG_UNIT_G_PK       | 0x0105 | 261 | g, RMS |
| eAVI_ENG_UNIT_MILS_PK_PK | 0x0106 | 262 | mils, peak to peak |
| --- | --- | --- | --- |
| eAVI_ENG_UNIT_BOOL        | 0x1000 | 4096 | Boolean type data, 0 or 1 |
| eAVI_ENG_UNIT_ON_OFF      | 0x1001 | 4097 | On/off data, 0 or 1 |
| eAVI_ENG_UNIT_OPEN_CLOSED | 0x1002 | 4098 |Open/Closed data, 0 or 1 |
| --- | --- | --- | --- |
| eAVI_ENG_UNIT_RUN_HOURS | 0x1010 | 4112 | Run hours |
| --- | --- | --- | --- |
| eAVI_ENG_UNIT_LATITUDE  | 0x1020 | 4128 | Latitude |
| eAVI_ENG_UNIT_LONGITUDE | 0x1021 | 4129 | Longitude |
| --- | --- | --- | --- |
| eAVI_ENG_UNIT_REL_HUM  | 0x1031 | 4145 | Relative Humidity |
| eAVI_ENG_UNIT_ABS_HUM  | 0x1032 | 4146 | Absolute Humidity |
| --- | --- | --- | --- |
| eAVI_ENG_UNIT_PERCENT  | 0x1040 | 4160 | Percentage |
| --- | --- | --- | --- |
| eAVI_ENG_UNIT_PPM  | 0x1050 | 4176 | Parts per million |
| eAVI_ENG_UNIT_PPB  | 0x1051 | 4177 | Parts per billion |
| eAVI_ENG_UNIT_PPQ  | 0x1052 | 4178 | Parts per quadrillion |
| --- | --- | --- | --- |
| eAVI_ENG_UNIT_DB  | 0x1060 | 4192 | Decibels |
| eAVI_ENG_UNIT_DBA | 0x1061 | 4193 | Decibels adjusted|
| --- | --- | --- | --- |
| eAVI_ENG_UNIT_ADC_COUNTS | 0xF000 | 61440 | ADC Counts |
| --- | --- | --- | --- |







[Top](#toc)<br>
