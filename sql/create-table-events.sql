DROP TABLE events;
DROP TABLE event_type;
DROP TABLE event_event;

CREATE TABLE event_type (
	id serial primary key,
	title text UNIQUE,
	body text
);

CREATE TABLE events (
	id	serial primary key,
	type_id serial REFERENCES event_type (id),
	title text UNIQUE,
	body text,
	daterange tstzrange,
	daterange_uncertain tstzrange,
	date timestamp with time zone,
	date_uncertain tstzrange,
	coordinates geography(POINT,4326)
);

CREATE TABLE event_event (
	parent_event_id serial,
	event_id serial,
	primary key (parent_event_id, event_id)
);
