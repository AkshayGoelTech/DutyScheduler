/**
	All the code is completely original and belongs to Akshay Goel.
	Please contact me at akshaygoel1@gmail.com or visit my website akshaygoel.net to contact me.

	This Chrome Extension has been developed to assist RA's in the process of creating a duty schedule.
	All Code is protected under License.
*/

var Availability = function(){};
var Day = function(){};
var assignCount = function(){};
var saveFile = {};
var personArray = []; //Array of Persons
var Day = [];
var mapKeys;


$(document).ready(function() {

	$('#pollTitle').append('<button type="button" id="schedBtn">Schedule Duty</button>');	
	$('head').append('<link rel="stylesheet" href="' + 
		chrome.extension.getURL('css/modal/bootstrap.min.css') + '">');
	
	$('body').append('<div id="modalContent">HI</div>');
	$('#modalContent').load(chrome.extension.getURL('html/calendar.html'));

	$('#schedBtn').click(function() {
		parseAndAssignEveryone();
		$('#calModal').modal('show');
		saveData();
	})

})

function saveData() {
	var key = window.location.pathname.split("/")[2];
	var data = {'Day': Day, 'Availability': Availability, 'names': mapKeys, 'assignCount':assignCount, 'test': "3"};
	saveFile[key] = data;
	chrome.storage.sync.set(saveFile, function() {	
		start();
	});
}

function instantiateVariables() {
	Availability = function(){};
	Day = function(){};
	assignCount = function(){};
	personArray = []; //Array of Persons
	Day = [];
}

function parseAndAssignEveryone() {

	instantiateVariables();
	if ($('.asep')[0])
		$('.asep')[0].click(); //Open the fold in doodle poll to expose all dates if it exists

	var daysLeftToSchedule = [];
	for (var i = $('.participant')[1].children.length-1, k=0; i>=1 ; i--, k++) 
		{daysLeftToSchedule[k] = i;}

	/**
		Parsing the data into variables
		personArray stores names of all people who signed up
		Day stores 2 arrays - available and assigned.
			available - keeps track of names of people available for this day
			assigned - keeps track of people assigned for this day
			Day index begins from 1
		Availability stores the list of Days, indexed from 1, where a person is available.
	*/
	for (var i = 1; i < $('.participant').length; i++) {
		var currParticipant = $('.participant')[i];
		var name = currParticipant.children[0].children[2].title.split(" ")[0];
		personArray.push(name);

		Availability[personArray[personArray.length-1]] = [];
		for (var j = 1; j < currParticipant.children.length; j++) {
			//daysLeftToSchedule.push(i);
			var currAvailaibility = currParticipant.children[j].title;
			var avail = currAvailaibility.split(": ")[1];
			if (avail == "No") { //Means person is available
				Availability[personArray[personArray.length-1]].push(j);
				if (Day[j] === undefined) {
					Day[j] = {"available":[], "assigned":[]};
				}
				Day[j].available.push(name);
			}
		}
	}

	/*Created Sorted keys of Availabilty Array based on number of availablities*/
	mapKeys = Object.keys(Availability);
	mapKeys.sort(function(a,b){return Availability[a].length - Availability[b].length});


	for (var key in mapKeys) {
	    console.log(mapKeys[key] + " -> " + Availability[mapKeys[key]]);
	}

	while (daysLeftToSchedule.length > 0) {
		personArray = mapKeys.slice();
		for (var key = 0; key < mapKeys.length; key++) {
			console.log(daysLeftToSchedule);

			//No One Available
			if (daysLeftToSchedule.length > 0 && 
					Day[daysLeftToSchedule[daysLeftToSchedule.length - 1]].available.length == 0) {
				Day[dayToAssign].assigned.push("?");
				Day[dayToAssign].assigned.push("?");
				daysLeftToSchedule.pop();
				continue;
			}
			//debugger;
			var name = mapKeys[key];
			if (personArray.length == 0) {
				personArray = mapKeys.slice();
				key = 0;
			}
			if (!personArray.includes(name)) 
				continue;
			for (var i = 0; i < Availability[name].length; i++) {
				if (Day[Availability[name][i]].assigned.length == 0) {
					dayToAssign = Availability[name][i];

					//Only One Person Available
					if (Day[dayToAssign].available.length == 1) {
						Day[dayToAssign].assigned.push(name);
						Day[dayToAssign].assigned.push("?");
						daysLeftToSchedule.splice(daysLeftToSchedule.indexOf(dayToAssign), 1);
						personArray.splice(personArray.indexOf(name), 1);
						break;
					}

					var otherName = closestPersonAvailable(name, dayToAssign);
					if (otherName == "-1") {
						personArray = [];
						key = mapKeys.indexOf(name) - 1;
						break;
					}
					Day[dayToAssign].assigned.push(name);
					Day[dayToAssign].assigned.push(otherName);
					daysLeftToSchedule.splice(daysLeftToSchedule.indexOf(dayToAssign), 1);
					personArray.splice(personArray.indexOf(name), 1);
					personArray.splice(personArray.indexOf(otherName), 1);
					break;
				}
			}
		}
	}

	//Output
	for (var i = 1; i < $('.participant')[1].children.length-1; i++) {
		console.log("Day " + i + ": " + Day[i].assigned[0] + ", " + Day[i].assigned[1]);
		if (assignCount[Day[i].assigned[0]] === undefined) {
			assignCount[Day[i].assigned[0]] = 0;
		}
		if (assignCount[Day[i].assigned[1]] === undefined) {
			assignCount[Day[i].assigned[1]] = 0;
		}
		assignCount[Day[i].assigned[0]]+=1;
		assignCount[Day[i].assigned[1]]+=1;
	}

	for (var key in mapKeys) {
		console.log(mapKeys[key] + ": " + assignCount[mapKeys[key]]);
	}
}


function closestPersonAvailable(name, dayToAssign) {
	var i = 0;
	for (i = 0; i < mapKeys.length; i++) {
		if (name == mapKeys[i])
			break;
	}
	if (i == mapKeys.length-1) {
		i = -1;
	}
	var currentName = mapKeys[i+1];
	while (currentName != name) {
		if (Availability[currentName].includes(dayToAssign) && personArray.includes(currentName))
			return currentName;
		i++;
		if (i == mapKeys.length-1)
			i = -1;
		currentName = mapKeys[i+1];
	}
	return "-1";

}

function compare(a, b) {
	if (a.length < b.length) {
		return -1;
	}
	if (a.length < b.length) {
		return 1;
	}
	return 0;
}

function makeInputFile() {
	var inputFile = "";
	for (var key in mapKeys) {
		var name = mapKeys[key];
    	inputFile+=(name);
    	for (var i = 0; i < Availability[name].length; i++) {
    		inputFile+= (" " + Availability[name][i])
    	}
    	inputFile+="\n";
	}
	$('.modal-footer').append(inputFile);
}