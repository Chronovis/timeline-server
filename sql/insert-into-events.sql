TRUNCATE events;

INSERT INTO events (title, date_uncertain, coordinates) VALUES (
	'Birth of Vasco da Gama',
	'[1460-01-01, 1469-12-31]',
	ST_GeographyFromText('SRID=4326;POINT(37.954722 -8.864444)')
);

INSERT INTO events (title, date, coordinates) VALUES (
	'Death of Vasco da Gama',
	'1524-12-24',
	ST_GeographyFromText('SRID=4326;POINT(9.97 76.28)')
);

INSERT INTO events (title, daterange, daterange_uncertain) VALUES (
	'Vasco da Gama',
	'[1460-01-01, 1524-12-24]',
	'[1469-01-01, 1524-12-24]'
);

INSERT INTO events (title, daterange) VALUES (
	'Portugal',
	'[1128-06-26, infinity)'
);

INSERT INTO events (title, date) VALUES (
	'Battle of São Mamede',
	'1128-06-24'
);

INSERT INTO type (title) VALUES ('birth');
INSERT INTO type (title) VALUES ('death');
INSERT INTO type (title) VALUES ('person');
INSERT INTO type (title) VALUES ('country');
INSERT INTO type (title) VALUES ('other');

-- TRUNCATE event_event;
--
-- INSERT INTO event_event (parent_event_id, event_id) VALUES (3, 1);
-- INSERT INTO event_event (parent_event_id, event_id) VALUES (3, 2);
--
SELECT * FROM events;
