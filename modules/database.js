"use strict";
const sequeliz = require("sequelize");
const Op = sequeliz.Op;

function creat() {
	return new sequeliz({
		database: "d2eqdg4hnddgiq",
		username: "pkprxpexfbzbkw",
		password: "0104034f04c154d9b75bbecaff6998ef953d3438e1c12af2d790a0f7bf907766",
		host: "ec2-46-137-113-157.eu-west-1.compute.amazonaws.com",
		port: 5432,
		dialect: "postgres",
		dialectOptions: {
			ssl: true
		},
		define: {
			freezeTableName: true
		},
		uri: "postgres://pkprxpexfbzbkw:0104034f04c154d9b75bbecaff6998ef953d3438e1c12af2d790a0f7bf907766@ec2-46-137-113-157.eu-west-1.compute.amazonaws.com:5432/d2eqdg4hnddgiqHeroku CLI\n" +
		"heroku pg:psql postgresql-symmetrical-00864 --app postgres-db-v"
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
	const KEY = "dsadas";

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