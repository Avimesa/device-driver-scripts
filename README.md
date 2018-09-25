# Avimesa Device Driver Scripts

This project contains example Device Driver Scripts and Configurations to be used with the Avimesa Device Cloud.

## Getting Started

The following scripts can be downloaded and used as is or as a starting point to build custom scripts.

## Prerequisites

- Avimesa Toolkit credentials

## Examples

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

The entry point of the script is `avmsaMain()`.  We immediately send the device's data along to the raw queue using `avmsaSendToRawQueue()`, which sends the `dev_in` JSON object 'as-is' to the `raw_q` FIFO queue.

Then, we grab the 'next' actuation message for the device (if any) using the `avmsaSendToRawQueue()`.  We set the response of this function call to the `dev_out.actuation` field to pass the actuation command 'as-is' to the device.

