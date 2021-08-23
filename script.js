{

	init: function(elevators, floors) {

		let ignoredFloor = (f) => {
			elevators.forEach(e => {
				if (	
						e.callIntern.includes(f) ||
						(e.currentFloor() > f && e.dir == 1) ||
						(e.currentFloor() < f && e.dir == -1)
					)	
				return false;
			})
			return true;
		}

		let nextMove = (e) => {
			if (e.nextFloor != -1)
				return;

			if (e.callIntern.length > 0) {
				e.nextFloor = e.callIntern[0];
				if (e.nextFloor > e.currentFloor()) {
					floors[e.nextFloor].needStopUp = false;
					e.dir = 1;
					e.goingUpIndicator(true);
					e.goingDownIndicator(false);
				}
				else {
					floors[e.nextFloor].needStopDown = false;
					e.dir = -1;
					e.goingUpIndicator(false);
					e.goingDownIndicator(true);
				}
				e.goToFloor(e.nextFloor);
			}
			else {
				let selectedFloor = floors[0];
				let dist = 99999;
				floors.forEach(f => {
					if (
						e.nextFloor == -1 &&
						(f.needStopUp || f.needStopDown) &&
						ignoredFloor(f.floorNum()) &&
						Math.abs(e.currentFloor() - f.floorNum()) < dist
					) {
						dist = Math.abs(e.currentFloor() - f.floorNum())
						selectedFloor = f;
					}
				})
				e.callIntern.push(selectedFloor.floorNum());
				if (e.callIntern[0] > e.currentFloor()) {
					selectedFloor.needStopDown = false;
					e.dir = 1;
					e.goingUpIndicator(true);
					e.goingDownIndicator(false);
				}
				else {
					selectedFloor.needStopUp = false;
					e.dir = -1;
					e.goingUpIndicator(false);
					e.goingDownIndicator(true);
				}
				nextMove(e);
			}
		}

		//EVENT HANDLERS FLOORS
		floors.forEach(f => {
			f.needStopUp = false;
			f.needStopDown = false;

			f.on("up_button_pressed", function() {
				f.needStopUp = true;
				elevators.forEach(e => nextMove(e));
			});

			f.on("down_button_pressed", function() {
				f.needStopDown = true;
				elevators.forEach(e => nextMove(e));
			});

		})

		//EVENT HANDLERS ELEVATORS
		elevators.forEach(e => {
			e.goingUpIndicator(true);
			e.goingDownIndicator(false);
			e.nextFloor = -1;
			e.dir = 1;
			e.callIntern = [];

			e.on("passing_floor", function(floorNum, direction) {
				if (e.callIntern.includes(floorNum))
					e.goToFloor(floorNum, true);
				else if (floors[floorNum].needStopUp && e.dir == 1)
					e.goToFloor(floorNum, true);
				else if (floors[floorNum].needStopDown && e.dir == -1)
					e.goToFloor(floorNum, true);
			});

			e.on("idle", function() {
				e.nextFloor = -1;
				nextMove(e);
			});

			e.on("stopped_at_floor", function(floorNum) {
				e.callIntern = e.callIntern.filter(f => f != floorNum);
				if (e.callIntern[0] > e.currentFloor() || e.currentFloor() == 0) {
					floors[floorNum].needStopUp = false;
					e.dir = 1;
					e.goingUpIndicator(true);
					e.goingDownIndicator(false);
				}
				else if (e.callIntern[0] < e.currentFloor() || e.currentFloor() == floors.length - 1) {
					floors[floorNum].needStopDown = false;
					e.dir = -1;
					e.goingUpIndicator(false);
					e.goingDownIndicator(true);
				}
				else {
					floors[floorNum].needStopDown = false;
					floors[floorNum].needStopUp = false;
					e.dir = 0;
					e.goingUpIndicator(true);
					e.goingDownIndicator(true);
				}
			});

			e.on("floor_button_pressed", function(floorNum) {
				if (e.callIntern.includes(floorNum) || e.nextFloor == floorNum)
					return;

				e.callIntern.push(floorNum);
			});
		})

	},
	update: function(dt, elevators, floors) {

	}
}