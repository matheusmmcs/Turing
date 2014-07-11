
var Turing = function (steps1, steps2, start, end) {
	this.steps1 = steps1;
	this.steps2 = steps2;
	this.start = start;
	this.end = end;
	this.tape1 = [];
	this.tape2 = [];
	this.length = 40;
	this.speed = 50;
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
		$('#run').removeAttr('disabled');
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
	var start = 1;

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
	$("#run").removeAttr('disabled');
	$('#step').removeAttr('disabled');
	$('#reset').removeAttr('disabled');

	//reset all save buttons
	$('#save-config').addClass("hidden");
	$('#save-automato').addClass("hidden");
	$('#save-automato-config').addClass("hidden");
	$('#set-head').addClass("hidden");
	$('#save-tape').addClass("hidden");

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
	
	$("#steps-area").val(this.stepsToString());
	$("#finalstates").val(this.end.join(";"));
	$("#initialstate").val(this.start);
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

	var value1 = $(this.tape1class + ' .active input').val();
	var value2 = $(this.tape2class + ' .active input').val();

	console.log('T1 Evaluate ' + this.current + ' with value ' + value1);
	console.log('T2 Evaluate ' + this.current + ' with value ' + value2);

	var step1 = this.steps1[this.current + ':' + value1];
	var step2 = this.steps2[this.current + ':' + value2];

	if (typeof step1 != 'undefined' && typeof step2 != 'undefined') {
		if(step1.state == step2.state){
			this.current = step1.state;
			this.count++;
			this.timeout = setTimeout(function (that) {
				that.write(step1, step2);
			}, 1, this);
		}else{
			this.exception('Tape 1 next state is diff to Tape 2 = ' + this.current + ' reading ' + value1 + ' and ' + value2 + ' (' + step1.state + ' != ' + step2.state + ')');
		}
	} else {
		this.exception('Tape 1 undefined state ' + this.current + ' with value ' + value1 + ' or ' + 'Tape 2 undefined state ' + this.current + ' with value ' + value2);
	}
};

/**
 * Method to write value.
 */
Turing.prototype.write = function (step1, step2) {

	console.log("Write value " + step1.value);
	// write
	$(this.tape1class + ' .active input').val(step1.value);
	$(this.tape2class + ' .active input').val(step2.value);

	this.timeout = setTimeout(function (that) {
		that.move(step1, step2);
	}, 1000 / this.speed, this);
};

/**
 * Method to move Turing to next step.
 */
Turing.prototype.move = function (step1, step2) {

	console.log("Move " + step1.move);
	
	mv($(this.tape1class + ' .active'), step1);
	mv($(this.tape2class + ' .active'), step2);

	// move
	function mv(active, step){
		active.removeClass('active');
		var move = "";
		switch (step.move) {
			case 'left':
				// move left
				move = "left";
				if (!active.prev().prev().length) {
					active.before(this.field());
				}
				active.prev().addClass('active');
				break;

			default:
				// move right
				move = "right";
				if (!active.next().next().length) {
					active.after(this.field());
				}
				active.next().addClass('active');
		}
		return move;
	}

	this.info();

	if (this.stop == false) {
		this.timeout = setTimeout(function (that) {
			that.check();
		}, 1000 / this.speed, this);
	} else {
		// stopped
		$('#run span').text("Run");
		$('#run i').attr("class", "fa fa-play");
		$("#run").removeAttr('disabled');
		$('#step').removeAttr('disabled');
		$('#reset').removeAttr('disabled');	
	}
};

/**
 * Check if we keep it running.
 */
Turing.prototype.check = function () {

	if (this.end.indexOf(this.current) == -1) {
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
		$('#reset').removeAttr('disabled');

		this.exception('Ok, you have reached a final state!');
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
	for(var i in this.steps1){
		var q = i.split(":");
		var s = this.steps1[i];
		result += "T1("+q[0]+","+q[1]+") = ("+s.state+","+s.value+","+s.move+");\n";
	}
	result += "\n";
	for(var i in this.steps2){
		var q = i.split(":");
		var s = this.steps2[i];
		result += "T2("+q[0]+","+q[1]+") = ("+s.state+","+s.value+","+s.move+");\n";
	}
	return result;
}

Turing.prototype.stringToSteps = function(textarea){
	var steps1 = {}, steps2 = {};
	var s = textarea.split(";");
	var regexp = /(T[1,2]?)\(([^\,]*)\,([^\)])?\)\s*\=\s*\(([^\,]*)\,([^\,]*)?\,([^\,]*)\)/;

	function r(s){
		if(s === undefined || s === null){
			return "";
		}else{
			return s.replace(/\s/, "");
		}
	}

	function addEl(obj, matches){
		obj[r(matches[2])+":"+r(matches[3])] = {state: r(matches[4]), value: r(matches[5]), move: r(matches[6])};
	}

	for(var i in s){
		var line = s[i].replace("\n", "");
		console.log(line)
		var matches = regexp.exec(line);
		if(matches){
			if(r(matches[1]) == "T1"){
				addEl(steps1, matches);
			}else if(r(matches[1]) == "T2"){
				addEl(steps2, matches);
			}
		}
	}

	console.log(steps1);
	console.log(steps2);

	this.steps1 = steps1;
	this.steps2 = steps2;
}

Turing.prototype.setHead = function($this){	
	if($this.closest(".turing-tape1").length){
		$(".turing-tape1 .active").removeClass("active");
		//var idx = $(".turing-tape1 input").index($this);
		//$(".turing-tape2 input").eq(idx).parent().addClass("active");
	}
	if($this.closest(".turing-tape2").length){
		$(".turing-tape2 .active").removeClass("active");
		//var idx = $(".turing-tape2 input").index($this);
		//$(".turing-tape1 input").eq(idx).parent().addClass("active");
	}
	$this.parent().addClass("active");
}

Turing.prototype.exception = function(s){
	alert(s);
	console.log(s);
	this.run();
	$('#reset').removeAttr('disabled');
}