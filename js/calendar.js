

function start() {
	getData();
}

function getData() {
	var key = "" + window.location.pathname.split("/")[2];	
	chrome.storage.sync.get(key, function(storage){	
		makeCalendar(storage[key]);
	});
}

function makeCalendar(storage) {
	$('#cal-table').remove();
	$('#cal-body-r2').text('');
	$('#cal-body-r2').append('<b>Duty Counter:</b><br></div>');
	$('#cal-label').text($('#pollTitle').text().split('Schedule Duty')[0]);
	var cols = 7;
	var rows = Math.floor(storage.Day.length / cols) + 1;

	$('#cal-body-r1').append('<table id="cal-table" border="1px solid black" style="width:100%;"> <tbody></tbody></table>');
	var tableRef = document.getElementById('cal-table').getElementsByTagName('tbody')[0];
	var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var weekRow = tableRef.insertRow(0);
	weekRow.id = "weekRow";
	for (var x in weekday) {
		var newCell = weekRow.insertCell(x);
		newCell.appendChild(document.createTextNode(weekday[x]));
	}

	for (var i = 0, count = 0; i < rows; i++) {
		var newRow = tableRef.insertRow(tableRef.rows.length);
		for (var j = 0; j < cols; j++, count++) {
			var newCell  = newRow.insertCell(j);
			newCell.id = "cell-" + count;
		}
		$('#cal-table').append('</tr>');
	}

	var firstDay = $('.participant')[1].children[1].title.split(", ")[1].split(": ")[0].split(' ')[1];
	var dateObject = new Date(firstDay);
	var currCellId = dateObject.getDay();

	for (var i = 1; i < storage.Day.length; i++) {
		var RAs = storage.Day[i].assigned;
		var currCell = $('#cell-' + currCellId);
		currCell.text('');
		currCell.append("<div class='dateNum'>" + i + "</div>");
		currCell.append(RAs[0].split(' ')[0] + "<br>");
		currCell.append(RAs[1].split(' ')[0]);
		currCellId++;
	}

	storage.names.sort(function(a,b){return assignCount[a] - assignCount[b]});
	for (var i = 0; i < storage.names.length; i++) {
		var name = storage.names[i];
		$('#cal-body-r2').append(name.split(' ')[0] + ": " + storage.assignCount[name] + "<br>");
	}
}