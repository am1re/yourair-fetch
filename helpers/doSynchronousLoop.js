/**
 * Process an array of data synchronously.
 *
 * @param data An array of data.
 * @param processData A function that processes an item of data.
 *                    Signature: function(item, i, callback), where {@code item} is the i'th item,
 *                               {@code i} is the loop index value and {@code calback} is the
 *                               parameterless function to call on completion of processing an item.
 */
function doSynchronousLoop(data, processData, done) {
	if (data.length > 0) {
		var loop = function (data, i, processData, done) {
			processData(data[i], i, function () {
				if (++i < data.length) {
					loop(data, i, processData, done);
					// setTimeout(function () { loop(data, i, processData, done); }, 0);
				} else {
					done();
				}
			});
		};
		loop(data, 0, processData, done);
	} else {
		done();
	}
}

export default doSynchronousLoop