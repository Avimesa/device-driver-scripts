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