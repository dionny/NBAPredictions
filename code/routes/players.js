var express = require('express');
var router = express.Router();
var path = require('path');
var collectPlayerNames = require('../collection/collectPlayerNames.js');
var player_loader = new collectPlayerNames();

/* load player data into the database. */
router.get('/load', function(req, res, next) {
	var filename = req.query.filename;

	if(typeof filename !== 'undefined' && filename !== null) {
		var filepath = path.join("./routes/", filename);
		player_loader.LoadPlayers(filepath, function(result) {
			res.send(result);
		}, function() {
			res.send("an error has occured.");
		});
	} else {
		res.send("please include a file name.");
	}
});

module.exports = router;
