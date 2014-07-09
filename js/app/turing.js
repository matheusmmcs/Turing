
var Turing = function (steps, start, end) {
	this.steps = steps;
	this.start = start;
	this.end = end;
	this.tape1 = [];
	this.tape2 = [];
	this.length = 40;
	this.speed = 10;
	this.stop = true;
	this.count = 0;

	this.tape1class = ".turing-tape1";
	this.tape2class = ".turing-tape2";
}

/**
 * Method to run the Turing machine.
 */
Turing.prototype.run = function () {

	if (this.stop) {

		$('#run span').text("Pause");
		$('#run i').attr("class", "fa fa-pause");
		$('#step').attr('disabled', 'disabled');
		$('#reset').attr('disabled', 'disabled');

		this.stop = false;

		// start machine
		this.machine();

	} else {

		// Pause
		this.stop = true;
		$('#run span').text("Pausing…")
		$('#run i').attr("class", "fa fa-pause");
		$('#run').attr('disabled', 'disabled');
	}
};

Turing.prototype.changeTape = function () {
	var that = this;
	that.tape1 = [];
	$.each($(this.tape1class+' li input'), function(){
		var val = $(this).val();
		if(val){
			that.tape1.push(val);
		}
	});
	that.tape2 = [];
	$.each($(this.tape2class+' li input'), function(){
		var val = $(this).val();
		if(val){
			that.tape2.push(val);
		}
	});
}

Turing.prototype.reset = function () {
	var start = 2;

	function resetTape(tapeClass, tape){
		$(tapeClass).text('');
		for (var i = 0; i < this.length; i++) {
			$(tapeClass).append(this.field());
		}
		for (var i in tape) {
			$(tapeClass + ' li:eq(' + (start + parseInt(i)) + ') input').val(tape[i]);
		}
		$(tapeClass + ' li:eq(' + start + ')').addClass('active');
	}

	resetTape.call(this, this.tape1class, this.tape1);
	resetTape.call(this, this.tape2class, this.tape2);

	this.current = this.start;
	this.count = 0;

	$('#run span').text("Run");
	$('#run i').attr("class", "fa fa-play");
	$("#run").attr('disabled', '');
	$('#step').attr('disabled', '');

	this.info();
};

Turing.prototype.info = function () {
	$('#count').text(this.count);
	$('#state').text(this.current);

	$('#speed').val(this.speed);
	$('#tape-size').val(this.length);

	$('#canvas .state').attr({fill: 'none', stroke: '#000'});
	$('#canvas .state.' + this.current).attr({fill: '#7d9cec', stroke: '#0a3268'});
	$('#canvas .text').attr({fill: '#000'});
	$('#canvas .text.' + this.current).attr({fill: '#fff'});
	
	$("#steps-area").text(this.stepsToString());
};

Turing.prototype.field = function (value) {
	if (!value) {
		value = '';
	}
	return $('<li><input type="text" size="1" maxlength="1" /></li>');
};

/**
 * Method to read value and run state to get next step.
 */
Turing.prototype.machine = function () {

	var value = $(this.tape1class + ' .active input').val();

	console.log('Evaluate ' + this.current + ' with value ' + value);

	var step = this.steps[this.current + ':' + value];

	if (typeof step != 'undefined') {

		this.current = step.state;
		this.count++;

		this.timeout = setTimeout(function (that) {
			that.write(step);
		}, 1, this);

	} else {
		console.log('Undefined state ' + this.current + ' with value ' + value);
	}
};

/**
 * Method to write value.
 */
Turing.prototype.write = function (step) {

	console.log("Write value " + step.value);

	// write
	$(this.tape1class + ' .active input').val(step.value);

	this.timeout = setTimeout(function (that) {
		that.move(step);
	}, this.speed, this);
};

/**
 * Method to move Turing to next step.
 */
Turing.prototype.move = function (step) {

	console.log("Move " + step.move);

	var active = $(this.tape1class + ' .active');

	// move
	active.removeClass('active');
	switch (step.move) {

		case 'left':
			// move left
			if (!active.prev().prev().length) {
				active.before(this.field());
			}
			active.prev().addClass('active');
			break;

		default:
			// move right
			if (!active.next().next().length) {
				active.after(this.field());
			}
			active.next().addClass('active');
	}

	this.info();

	if (this.stop == false) {

		this.timeout = setTimeout(function (that) {
			that.check();
		}, this.speed, this);

	} else {

		// stopped
		$('#run span').text("Run");
		$('#run i').attr("class", "fa fa-play");
		$("#run").attr('disabled', '');
		$('#step').attr('disabled', '');
		$('#reset').attr('disabled', '');	
	}
};

/**
 * Check if we keep it running.
 */
Turing.prototype.check = function () {

	if (this.current != this.end) {

		// all good
		this.machine();

	} else {

		console.log("Final " + this.current);

		var result = [];
		$(this.tape1class + ' input').each(function () {
			result[result.length] = $(this).val()
		});
		var sum = result.lastIndexOf('1') > result.indexOf('=') ? result.lastIndexOf('1') - result.indexOf('=') : 0;

		// end of machine
		this.stop = true;

		$('#run span').text("Run");
		$('#run i').attr("class", "fa fa-play");
		$("#run").attr('disabled', 'disabled');
		$('#step').attr('disabled', 'disabled');
		$('#reset').attr('disabled', '');
	}
};

Turing.prototype.step = function () {

	$('#run').attr('disabled', 'disabled')
	$('#step').attr('disabled', 'disabled');
	$('#reset').attr('disabled', 'disabled');

	this.stop = true;

	// start for one step machine
	this.check();
};

Turing.prototype.stepsToString = function(){
	var result = "";
	for(var i in this.steps){
		var q = i.split(":");
		var s = this.steps[i];
		result += "Q("+q[0]+","+q[1]+") = ("+s.state+","+s.value+","+s.move+");\n"
	}
	return result;
}

Turing.prototype.stringToSteps = function(textarea){
	var steps = {};
	var s = textarea.split(";");
	var regexp = /Q\(([^\,]*)\,([^\)])?\)\s*\=\s*\(([^\,]*)\,([^\,]*)?\,([^\,]*)\)/;

	function r(s){
		if(s === undefined || s === null){
			return "";
		}else{
			return s.replace(/\s/, "");
		}
	}

	for(var i in s){
		var line = s[i].replace("\n", "");
		var matches = regexp.exec(line);
		if(matches){
			steps[r(matches[1])+":"+r(matches[2])] = {state: r(matches[3]), value: r(matches[4]), move: r(matches[5])};
			//console.log(r(matches[1])+":"+r(matches[2]), {state: r(matches[3]), value: r(matches[4]), move: r(matches[5])})
		}
	}

	this.steps = steps;
}