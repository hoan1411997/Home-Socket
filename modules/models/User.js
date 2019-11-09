module.exports = function(dbConn, sequeliz) {
	return dbConn.define('user', {
		id: {
			type: sequeliz.STRING,
			allowNull: false,
			primaryKey: true

		},
		phone: sequeliz.STRING,
		name: sequeliz.STRING
	});
}