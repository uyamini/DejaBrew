const MAP_SIZE = 700


//northwestern campus center
// const NU_CENTER = ol.proj.fromLonLat([-87.6753, 42.056])

// downtown center, uncomment to use downtown instead, or make your own
const NU_CENTER = ol.proj.fromLonLat([-87.6813, 42.049])



const AUTOMOVE_SPEED = 100
const UPDATE_RATE = 1000



/*
 Apps are made out of a header (title/controls) and footer
 and some number of columns
 If its vertical, the columns can become sections in one column
 */


let landmarkCount = 0

let gameState = {
	points: 0,
	captured: [],
	negatives: [],
	messages: [],
	time_since: 0
}

// Create an interactive map
// Change any of these functions



// COFFEE SHOP GAME
// add caffeine "points" to your score when near a cafe
//subtract caffeine "points" from score when near a decaf cup... (might change) 
// ^^ randomly generated positions


let map = new InteractiveMap({
	mapCenter: NU_CENTER,

	// Ranges
	ranges: [500, 200, 90, 1], // must be in reverse order

	initializeMap() {
		// A good place to load landmarks
		this.loadLandmarks("landmarks-coffee-shops-evanston", (landmark) => {
			// Keep this landmark?

			// Keep all landmarks in the set
			return true

			// Only keep this landmark if its a store or amenity, e.g.
			// return landmark.properties.amenity || landmark.properties.store
		})

		// Create random landmarks
		// You can also use this to create trails or clusters for the user to find
		for (var i = 0; i < 5; i++) {
			// make a polar offset (radius, theta) 
			// from the map's center (units are *approximately* meters)
			let position = clonePolarOffset(NU_CENTER, 400*Math.random() + 300, 20*Math.random())
			this.createLandmark({
				pos: position,
				name: "decaf " + i,
				bad: true,
			})
		}
	},

	update() {
		
		gameState.time_since += 1
		// Do something each frame
	},

	initializeLandmark: (landmark, isPlayer) => {
		// Add data to any landmark when it's created

		// Any openmap data?
		if (landmark.openMapData) {
			
			landmark.name = landmark.openMapData.name
			console.log(landmark.openMapData)
			
		}
		

		
		landmark.idNumber = landmarkCount++
		landmark.color = [Math.random(), 1, .5]

		// Give it a random number of points
		landmark.points = Math.floor(Math.random()*10 + 1)
		return landmark
	}, 

	onEnterRange: (landmark, newLevel, oldLevel, dist) => {
		// What happens when the user enters a range
		// -1 is not in any range

		console.log("enter", landmark.name, newLevel)
		console.log(gameState.messages)

		

			//if near a caffeine source	
		if (newLevel == 2 && !landmark.bad) {
			if (!gameState.captured.includes(landmark.name)){
				gameState.captured.push(landmark.name)
			}
			
			// Add a message
			gameState.messages.push(`You captured ${landmark.name} for ${landmark.points} points`)
			gameState.points += landmark.points
			gameState.time_since = 0
		}
		//if near a decaf
		if (newLevel == 2 && landmark.bad ) {
			gameState.negatives.push(landmark.name)
			// Add a message
			gameState.messages.push(`Uh oh... you got too close to ${landmark.name} and lost ${landmark.points} points`)
			gameState.points -= landmark.points
		}

		}
	,

	onExitRange: (landmark, newLevel, oldLevel, dist) => {
		// What happens when the user EXITS a range around a landmark 
		// e.g. (2->1, 0->-1)
		
		console.log("exit", landmark.name, newLevel)
	},
	
	
	featureToStyle: (landmark) => {
		// How should we draw this landmark?
		// Returns an object used to set up the drawing

		if (landmark.isPlayer) {
			return {
				icon: "person_pin_circle",
				noBG: true // skip the background
			}
		}
		
		// Pick out a hue, we can reuse it for foreground and background
		let hue = landmark.points*.1
		return {
			label: landmark.name + "\n" + landmark.distanceToPlayer +"m",
			fontSize: 8,

			// Icons (in icon folder)
			icon: "person_pin_circle",

			// Colors are in HSL (hue, saturation, lightness)
			iconColor: [hue, 1, .5],
			bgColor: [hue, 1, .2],
			noBG: false // skip the background
		}
	},

	
})



window.onload = (event) => {


	const app = new Vue({
		template: `
		<div id="app">
		<header></header>
			<div id="main-columns">

				<div class="main-column" style="flex:1;overflow:scroll;max-height:200px">
				<div class="game-info">
					<h1> You Must Remain Caffeinated!</h1>

					<div class="points"> You have {{gameState.points}} points </div>


					<div class="time_since" style=margin-left:20px;margin-bottom:20px;border-radius:8px;> <b> It has been {{gameState.time_since}} seconds since you have had caffeine </div>
					
					<div class="visited-cafes" style=margin-left:20px;margin-bottom:20px;border-radius:8px;> <b>You have visited: {{gameState.captured}} </div>
					
				
					<div class="current-msg"> {{gameState.messages[gameState.messages.length - 1]}} </div>
				</div>
				</div>

				<div class="main-column" style="overflow:hidden;width:${MAP_SIZE}px;height:${MAP_SIZE}px">
					<location-widget :map="map" />
				
				</div>

			</div>	
		<footer></footer>
		</div>`,

		data() {
			return {
			
				map: map,
				gameState: gameState
			}
		},

		// Get all of the intarsia components, plus various others
		components: Object.assign({
			// "user-widget": userWidget,
			// "room-widget": roomWidget,
			"location-widget": locationWidget,
		}),

		el: "#app"
	})

};

