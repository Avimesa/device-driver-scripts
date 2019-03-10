//
// List of channels to use
//
var aviChannelList =
[
	{ idx: 0, sensor_idx: 0},
	{ idx: 1, sensor_idx: 0},
	{ idx: 2, sensor_idx: 0},
	{ idx: 3, sensor_idx: 0},
	{ idx: 4, sensor_idx: 0},
	{ idx: 5, sensor_idx: 0},
	{ idx: 6, sensor_idx: 0}
];

//
// List of sensors to use
//
var aviSensorList =
[
	{ idx: 0, type: "Temperature", model: "XTP25N_050_0300F", unit_str: "F", unit_idx: 17,  m_val : 18750.0, b_val : -75.0}
];

var AVI_ENG_UNIT_AMPS_DC = 0x0001;


/**@brief Processes raw 4-20mA channels
 *
 * @details This function will translate the raw 4-20mA channel readings
 *          into the processed values and enqueue the datum
 *
 * @param[in] avi_object - the avi_object
 *
 * @returns none
 */
function processRawTo420(dev_in){
	if (dev_in != null && dev_in.dev != null){

		if (dev_in.dev.chans != null){
			// we have channels... iterate over them
			for (i = 0; i < dev_in.dev.chans.length; i++){

				if (dev_in.dev.chans[i].ch_data[0] != null){
					//
					if (dev_in.dev.chans[i].ch_data[0].units == AVI_ENG_UNIT_AMPS_DC){

						// get the channel
						var channel = aviChannelList[i];

						// is the channel defined?
						if (channel != null && isNaN(channel.sensor_idx) == false){

							// get the sensor from our list
							var sensor = aviSensorList[channel.sensor_idx];

							// make sure we have a sensor defined
							if (sensor != null){
								// y = mx + b
								var val = (sensor.m_val * dev_in.dev.chans[i].ch_data[0].val) + sensor.b_val;

								if (val < 0.0){
									val = 0.0;
								}
								dev_in.dev.chans[i].ch_data[0].val = val;
								dev_in.dev.chans[i].ch_data[0].units = sensor.unit_idx;
							}
						}
					}
				}
			}
		}
	}
}

/**@brief Entry point for Device Driver Script
 *
 * @returns none
 */
function avmsaMain(){

	// translate
	processRawTo420(dev_in);

	// Send the 'dev_in' data to the raw queue
	avmsaSendToRawQueue();

	// Get the next actuation messsge (if any) and relay to device
	dev_out.actuation = avmsaGetNextActuationMsg();
}
