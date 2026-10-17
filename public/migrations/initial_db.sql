BEGIN TRANSACTION;

PRAGMA foreign_keys = 1;

CREATE TABLE IF NOT EXISTS "activities" (
	"ac_id"	INTEGER PRIMARY KEY,
	"ac_name" VARCHAR(50),
	"ac_started_at"	INTEGER NOT NULL,
	"ac_ended_at"	INTEGER
	-- "ac_timezone" VARCHAR(3) NOT NULL,
	-- PRIMARY KEY("ac_id")
);
INSERT INTO `activities` (ac_name, ac_started_at, ac_ended_at) VALUES ("Test activiteit",1791552070,1791553990);

CREATE TABLE IF NOT EXISTS "geolocation_points" (
	"glp_id"	INTEGER PRIMARY KEY,
	"glp_latitude"	REAL NOT NULL,
	"glp_longitude"	REAL NOT NULL,
	"glp_activity_id" INTEGER NOT NULL,
	-- PRIMARY KEY("glp_id"),
	FOREIGN KEY (glp_activity_id) REFERENCES activities(ac_id)
);

INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.536378, 4.275150, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.536440, 4.275156, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.536546, 4.275182, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.536646, 4.275198, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.536719, 4.275195, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.536807, 4.275198, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.536923, 4.275185, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.536985, 4.275204, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.537085, 4.275203, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.537120, 4.275191, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.537354, 4.275189, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.537459, 4.275186, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.537526, 4.275129, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.537519, 4.274681, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.537510, 4.274204, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.537497, 4.273916, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.537289, 4.273903, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.537024, 4.273904, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.536701, 4.273920, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.536556, 4.273933, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.536557, 4.274234, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.536563, 4.274535, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.536559, 4.274920, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.536569, 4.275120, 1);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_activity_id) VALUES (51.536487, 4.275176, 1);
COMMIT;