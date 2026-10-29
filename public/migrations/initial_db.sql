BEGIN TRANSACTION;

PRAGMA foreign_keys = 1;

CREATE TABLE IF NOT EXISTS "activity_categories" (
	"acat_id" INTEGER PRIMARY KEY,
	"acat_created" INTEGER,
	"acat_updated" INTEGER,
	"acat_name" VARCHAR(50)
);
INSERT INTO "activity_categories" (acat_created, acat_updated, acat_name) VALUES (1792848415, NULL, 'Uncategorized');


CREATE TABLE IF NOT EXISTS "activities" (
	"ac_id"	INTEGER PRIMARY KEY,
	"ac_name" VARCHAR(50),
	"ac_started_at"	INTEGER NOT NULL,
	"ac_ended_at"	INTEGER,
	"ac_acat_id" INTEGER,
	FOREIGN KEY (ac_acat_id) REFERENCES activity_categories(acat_id) 
	-- "ac_timezone" VARCHAR(3) NOT NULL,
	-- PRIMARY KEY("ac_id")
);
INSERT INTO `activities` (ac_name, ac_started_at, ac_ended_at,ac_acat_id) VALUES ('Test activiteit',1791552070,1791553990,1);
-- Start 1791552070
-- End 1791553990

CREATE TABLE IF NOT EXISTS "geolocation_points" (
	"glp_id" INTEGER PRIMARY KEY,
	"glp_latitude" REAL NOT NULL,
	"glp_longitude" REAL NOT NULL,
	"glp_ac_id" INTEGER NOT NULL,
	"glp_index" INTEGER NOT NULL,
	"glp_timestamp" INTEGER NOT NULL,
	"glp_accuracy" INTEGER NOT NULL,
	-- PRIMARY KEY("glp_id"),
	FOREIGN KEY (glp_ac_id) REFERENCES activities(ac_id)
);

INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.536378, 4.275150, 1, 1,  1, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.536440, 4.275156, 1, 2,  2, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.536546, 4.275182, 1, 3,  3, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.536646, 4.275198, 1, 4,  4, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.536719, 4.275195, 1, 5,  5, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.536807, 4.275198, 1, 6,  6, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.536923, 4.275185, 1, 7,  7, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.536985, 4.275204, 1, 8,  8, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.537085, 4.275203, 1, 9,  9, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.537120, 4.275191, 1, 10, 10, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.537354, 4.275189, 1, 11, 11, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.537459, 4.275186, 1, 12, 12, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.537526, 4.275129, 1, 13, 13, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.537519, 4.274681, 1, 14, 14, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.537510, 4.274204, 1, 15, 15, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.537497, 4.273916, 1, 16, 16, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.537289, 4.273903, 1, 17, 17, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.537024, 4.273904, 1, 18, 18, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.536701, 4.273920, 1, 19, 19, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.536556, 4.273933, 1, 20, 20, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.536557, 4.274234, 1, 21, 21, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.536563, 4.274535, 1, 22, 22, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.536559, 4.274920, 1, 23, 23, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.536569, 4.275120, 1, 24, 24, 0.35);
INSERT INTO `geolocation_points` (glp_latitude, glp_longitude, glp_ac_id, glp_index, glp_timestamp, glp_accuracy) VALUES (51.536487, 4.275176, 1, 25, 25, 0.35);

COMMIT;