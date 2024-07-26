const express = require("express");
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// In-memory data storage
let rounds = [];
fs.readFile('./golf_round.json', 'utf8', function (err, data) {
	rounds = JSON.parse(data.toString('utf8').replace(/^\uFEFF/, ''));
});
let nextId = 1;

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

// Create a Round (POST /rounds)
app.post("/api/rounds", (req, res) => {
	let data = {
		rounds: []
	}
	fs.readFile('./golf_round.json', 'utf8', function (err, data) {
		data = JSON.parse(data.toString('utf8').replace(/^\uFEFF/, ''));
		const { courseName, username, scores } = req.body;
		if (!courseName || !username || !Array.isArray(scores)) {
			return res.status(400).json({ error: "Invalid input" });
		}

		const newRound = { id: data.rounds.length + 1, courseName, username, scores };
		data.rounds.push(newRound);

		fs.writeFile('./golf_round.json', JSON.stringify(data), (err) => {
			if (err) return 0;
			return res.status(201).json({ message: "User created successfully!" })
		});

	});

});

// Retrieve All Rounds (GET /rounds)
app.get("/api/rounds", (req, res) => {
	let datares = {}
	fs.readFile('./golf_round.json', 'utf8', function (err, data) {
		datares = JSON.parse(data.toString('utf8').replace(/^\uFEFF/, ''));
		res.status(200).json(datares);
	});

});

// Retrieve a Specific Round (GET /rounds/{id})
app.get("/api/rounds/:id", (req, res) => {
	let datares = {}
	fs.readFile('./golf_round.json', 'utf8', function (err, data) {
		datares = JSON.parse(data.toString('utf8').replace(/^\uFEFF/, ''));

		const round = datares.rounds.find((r) => r.id == req.params.id);
		if (!round) {
			return res.status(404).json({ error: "Round not found" });
		}
		res.status(200).json(round);
	});



});

// Update a Round (PUT /rounds/{id})
app.put("/api/rounds/:id", (req, res) => {
	const { courseName, username, scores } = req.body;

	let datares = {}
	fs.readFile('./golf_round.json', 'utf8', function (err, data) {
		datares = JSON.parse(data.toString('utf8').replace(/^\uFEFF/, ''));

		const user = datares.rounds.find((r) => r.id == req.params.id)

		if (!user) {
			return res.status(404).json({ error: "Round not found" });
		}
		if (!courseName || !username || !Array.isArray(scores)) {
			return res.status(400).json({ error: "Invalid input" });
		}


		datares['rounds'] = datares.rounds.map((r) => {
			if (r.id == req.params.id) {
				return { courseName, username, scores, id: r.id }
			}
			return r
		});

		fs.writeFile('./golf_round.json', JSON.stringify(datares), (err) => {
			if (err) return 0;
			return res.status(201).json({ message: "Data Updated successfully!" })
		});

	});


});

// Partially Update a Round (PATCH /api/rounds/{id})
app.patch("/api/rounds/:id", (req, res) => {
	const { courseName, username, scores } = req.body;

	let datares = {}
	fs.readFile('./golf_round.json', 'utf8', function (err, data) {
		datares = JSON.parse(data.toString('utf8').replace(/^\uFEFF/, ''));
		const user = datares.rounds.find((r) => r.id == req.params.id)
		if (!user) {
			return res.status(404).json({ error: "Round not found" });
		}
		datares['rounds'] = datares.rounds.map((r) => {
			if (r.id == req.params.id) {
				if (courseName) {
					r['courseName'] = courseName
				}
				if (username) {
					r['username'] = username
				}
				if (scores && scores.length) {
					r['scores'] = scores
				}
				return r
			}
			return r
		});

		fs.writeFile('./golf_round.json', JSON.stringify(datares), (err) => {
			if (err) return res.status(400).json({ error: "There is something error." });
			return res.status(201).json({ message: "Data Updated successfully!" })
		});
	});

});

//   Delete a Round (DELETE /rounds/{id})
app.delete("/api/rounds/:id", (req, res) => {
	let datares = {}
	fs.readFile('./golf_round.json', 'utf8', function (err, data) {
		datares = JSON.parse(data.toString('utf8').replace(/^\uFEFF/, ''));
		const roundIndex = datares.rounds.find((r) => r.id == req.params.id);
		if (!roundIndex) {
			return res.status(404).json({ error: "Round not found" });
		}
		datares['rounds'] = datares.rounds.filter((r) => +r.id !== +req.params.id)
		console.log(datares['rounds'])
		fs.writeFile('./golf_round.json', JSON.stringify(datares), (err) => {
			if (err) return res.status(400).json({ error: "There is something error." });
			return res.status(202).json({ message: "Data Deleted Successfully!" })
		});

	});


});

// Error Handling
app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});