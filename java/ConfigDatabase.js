class ConfigDatabase {

	constructor(name, license) {
		//class variables (public)
		this.name = name;
		this.license = license;
	}

		static  get POSTGRESS(){
		return {
			database: "d26n3cbmoiqf8",
			username: "dcgkfysmyggatn",
			password: "677c65c81321a49336247882b837ec772c8079f0b227548eae39871a8468f32c",
			host: "ec2-54-235-153-124.compute-1.amazonaws.com",
			port: 5432,
			dialect: "postgres",
			dialectOptions: {
				ssl: true
			},
			define: {
				freezeTableName: true
			},
			uri: "postgres://dcgkfysmyggatn:677c65c81321a49336247882b837ec772c8079f0b227548eae39871a8468f32c@ec2-54-235-153-124.compute-1.amazonaws.com:5432/d26n3cbmoiqf8Heroku CLI\n" +
			"heroku pg:psql postgresql-cylindrical-23047 --app postgres-online"
		}
		}

	static get USERTABLE_OBJ() {
		return {
			idfb: {
				type: sequeliz.STRING,
				allowNull: false,

			},
			gender: sequeliz.STRING,
			name: sequeliz.STRING,
			dob: sequeliz.STRING,
			urlavata: sequeliz.STRING,
			lfolow: sequeliz.ARRAY(sequeliz.STRING)


		}
	}

	static get POSTTABLE_OBJ() {
		return {
			idmember: {
				type: sequeliz.STRING,
				allowNull: false,

			},
			gender: sequeliz.STRING,
			name: sequeliz.STRING,
			urlimage: sequeliz.ARRAY(sequeliz.STRING),

			cap: sequeliz.STRING

		}
	}

	static get POSTTABLE_NAME() {
		return 'post';
	}

	static get USERTABLE_NAME() {
		return 'user';
	}
}