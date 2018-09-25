# Avimesa Device Driver Scripts

This project contains example Device Driver Scripts and Configurations to be used with the Avimesa Device Cloud.

## Getting Started

The following scripts can be downloaded and used as is or as a starting point to build custom scripts.

## Prerequisites

- Avimesa Toolkit credentials
- An Avimesa Device (or simulator)

## System Overview

```                                                

/-------------------------------- Avimesa Device Cloud -------------------------\ /---------- Client --------------\

                   B                                C1                              D
                   +------------------------.       +-------------------------.     
                   |Device Driver Engine    |-----> | Raw (raw_q)             |   
                   |                        |       .--------------------------
A                  |  +----------------.    |       C2
.------.           |  | Script         |    |       +-------------------------.          Client Application using
|Device| <-------> |  .-----------------    |-----> | Notification (not_q)    |              the Avimesa API
.------.           |                        |       .--------------------------
                   |  +----------------.    |       C3
                   |  | Config         |    |       +~~~~~~~~~~~~~~~~~~~~~~~~~.
                   |  .-----------------    |<----- | Actuation ('device id')|
                   |________________________|       .~~~~~~~~~~~~~~~~~~~~~~~~~~
                   
```
The Device (`A`) communicates through the Avimesa Device Cloud and the Device Driver Engine (`B`) executes a `Script` and configures a device with a `Config`.

The `Script` is an ECMA5.1 compliant JavaScript with additional Avimesa Device Cloud functions, namely:

- avmsaGetEpochTime
- avmsaSendToRawQueue
- avmsaSendToNotificationQueue
- avmsaGetNextActuationMsg
- avmsaWriteFile
- avmsaReadFile
- avmsaGetFiles
- avmsaSetStatusMsg

The `Script` has access to the Device's data, and can write device state to the Raw (`C1`) or Notification queues (`C2`).  The `Script` can also read from the Device's Actuation queue (`C3`).

The `Script` has access to the Device's configuration for dynamic updates, otherwise the static version will be used to configure the device.

Client applications can access the Avimesa Device Cloud via the Avimesa API (`D`), which presently supports an AMQP 0-9-1 interface (e.g. RabbitMQ based broker).

The Avimesa API is used to upload `Scripts` and `Configs` to devices.

## Quick Start Examples

### 01-the-bare-minimum

This example contains, as you could gather from the name, the bare minimum required to do something useful.

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

### 02-alarms-and-notifications

This example shows how one could inspect the device's data and trigger an alarm condition.  To distinguish 'normal' data from 'higher priority' data, the notification queue is used (accessed via the API's `not_q`).

The `dev_in` object here is from an Avimesa 1000, which is a seven channel device that, at its core, measures amperage readings from 4-20mA sensors.  The `dev_in` object is further described in the XX-device-input-object example.

```
function avmsaMain(){
    var alarm = false;

    const ALARM_VALUE_0 = 0.010;
    const ALARM_VALUE_1 = 0.015;

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