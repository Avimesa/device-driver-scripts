# Avimesa Device Driver Scripts

This project contains example Device Driver Scripts and Configurations to be used with the Avimesa Device Cloud.  The engine is based on JerryScript (http://jerryscript.net) and runs server side instead of device side.  Thanks to Tillman Scheller for JerryScript.

- [1. Getting Started](#1.-getting-started)
- [2. Prerequisites](#2.-prerequisites)
- [3. Device Driver Engine Overview](#3.-device-driver-engine-overview)
  * [3.1 Summary](#3.1-summary)
  * [3.2 Process Model](#3.2-process-model)
- [4. Native Functions](#4.-native-functions)
  * [4.1 avmsaGetEpochTime](#4.1-avmsaGetEpochTime)
  * [4.2 avmsaSendToRawQueue](#4.2-avmsaSendToRawQueue)
  * [4.3 avmsaSendToNotificationQueue](#4.3-avmsaSendToNotificationQueue)
  * [4.4 avmsaGetNextActuationMsg](#4.4-avmsaGetNextActuationMsg)
  * [4.5 avmsaWriteFile](#4.5-avmsaWriteFile)
  * [4.6 avmsaReadFile](#4.6-avmsaReadFile)
  * [4.7 avmsaGetFiles](#4.7-avmsaGetFiles)
  * [4.8 avmsaSetStatusMsg](#4.8-avmsaSetStatusMsg)
- [5. Quick Start Examples](#5.-quick-start-examples)
  * [01-the-bare-minimum](#01-the-bare-minimum)
  * [02-alarms-and-notifications](#02-alarms-and-notifications)
  * [03-using-a-file-for-session-state](#03-using-a-file-for-session-state)
      
<a id="1.-getting-started"></a>
## 1. Getting Started

The following scripts can be downloaded and used as is or as a starting point to build custom scripts.

<a id="2.-prerequisites"></a>
## 2. Prerequisites

- Avimesa Device Cloud credentials
- The Avimesa Toolkit (toolkit.avimesa.com)
- An Avimesa Device (or simulator)

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
The Device (`A`) communicates through the Avimesa Device Cloud and the Device Driver Engine (`B`) executes a `Script` and configures a device with a `Config`.  The whole interaction executes in a containerized environment for the device.

The `Script` is an ECMA 5.1 compliant JavaScript with additional Avimesa Device Cloud native functions covered in later sections.

The `Script` has access to the Device's data, and can write device state to the Raw (`C1`) or Notification queues (`C2`).  The `Script` can also read from the Device's Actuation queue (`C3`).

The `Script` has access to the Device's configuration for dynamic updates, otherwise the static version will be used to configure the device.

Client applications can access the Avimesa Device Cloud via the Avimesa API (`D`), which presently supports an AMQP 0-9-1 interface (e.g. RabbitMQ based broker).

The Avimesa API is used to upload `Scripts` and `Configs` to devices.

<a id="3.2-process-model"></a>
#### 3.2 Process Model 

A device connection will invoke the Device Driver Engine.  There is no session between transactions and are to be considered atomic in nature, with the exception of using the file access built in functions.

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
    if(currentState.open != lastState.open){
        avmsaSendToRawQueue();
    }

    // Save to disk
    avmsaWriteFile(currentState, 'lastState', 86400);
}
```

The script above simply loads the last state from disk and if there's a change in state, sends the data to the raw queue.