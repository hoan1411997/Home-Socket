"use strict";
const sequeliz = require("sequelize");
const Op = sequeliz.Op;

function creat() {
	return new sequeliz({
		database: "daqdm10l260m0e",
		username: "odbvcunjiubdch",
		password: "12b23ec78bfecf3262ad56ac740fb96908fb0b10d14b9fceff241318a0125a32",
		host: "ec2-46-137-187-23.eu-west-1.compute.amazonaws.com",
		port: 5432,
		dialect: "postgres",
		dialectOptions: {
			ssl: true
		},
		define: {
			freezeTableName: true
		},
		uri: "postgres://odbvcunjiubdch:12b23ec78bfecf3262ad56ac740fb96908fb0b10d14b9fceff241318a0125a32@ec2-46-137-187-23.eu-west-1.compute.amazonaws.com:5432/daqdm10l260m0eHeroku CLI\n" +
		"heroku pg:psql postgresql-clean-03942 --app dbhomes"
	});
}
const db = creat();
db.authenticate()
	.then(() => console.log("CONECTDATA: success"))
	.catch(err => console.log("CONECTDATA FAIL: ", err.message));

const usertable = require('./models/User')(db, sequeliz);
db.sync();
////-----------------------coment----------------------------------------------------------------------------------------------------------------
function Sequelize() {
	const KEY = "HOMESOCKET";

	function createUser(id, next, errs) {
		usertable.create({
			idfb: id
		}).then(user => {
				console.log("CREAT USER : ", user.get({plain: true}));
				next(user);
			})
			.catch(err => {
				console.log("CREAT USER  FAIL: ", err.message),
					errs();
			});
	}


	function getDatabase() {
		return db;
	}

	function userTable() {
		return usertable;
	}

	function Ops() {
		return Op;
	}



	function findUserbyFbid(id, next, error) {
		console.log("BYID", id)
		usertable.findOne({
			where: {id: id}}).then(user => {
				if (user == null) {
					error("Fail!");

				}
				else {
					console.log("LOGIN: ");
					next(user);
				}

			})
			.catch(err => {
				console.log("findOne FAIL: ", err.message);
				error();
			});
	}

	return {
		Ops,
		userTable,
		createUser,
		findUserbyFbid,
		KEY

	};

}


module.exports = Sequelize;