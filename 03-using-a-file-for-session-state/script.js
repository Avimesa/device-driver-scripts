/*
 * COPYRIGHT: This file and the source codes contained herein ("document") are
 * the property of Avimesa, Inc.  Copyright 2016-2018, Avimesa, Inc.
 *
 * LICENSE:  Avimesa, Inc. grants the RECIPIENT a worldwide, royalty free,
 * limited license to use the source codes in this document as specified
 * in the Avimesa Open License:  http://avimesa.com/openlicense.txt
 */

/**@brief Entry point for Device Driver Script
 *
 * @returns none
 */
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
        // Data has changed, send to client
        avmsaSendToRawQueue();

        // Save to disk
        avmsaWriteFile(currentState, 'lastState', 86400);
    }
}