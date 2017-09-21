#!/usr/bin/env node

import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as pg from 'pg';
// import DbConfig from './db-config';
import parseEvent from './parse-event';

// LOCAL
const pool = new pg.Pool({
	host: 'db',
	database: 'timeline',
	idleTimeoutMillis: 3000,
	max: 10,
	password: 'docker',
	port: 5432,
	user: 'docker',
});

// REMOTE
// const pool = new pg.Pool({
// 	database: DbConfig.database,
// 	host: DbConfig.host,
// 	idleTimeoutMillis: 3000,
// 	max: 10,
// 	password: DbConfig.password,
// 	port: 5432,
// 	user: DbConfig.user,
// });

const sql = (event) => {
	const s = `
	SELECT childEvent.*, array_agg(event_type.title) AS types
	FROM event as childEvent, event as parentEvent, event__event, event_type, event__event_type
	WHERE event__event.parent_event_id = parentEvent.id
		AND event__event.child_event_id = childEvent.id
		AND parentEvent.slug = '${event}'
		AND event__event_type.event_id = childEvent.id
		AND event__event_type.event_type_id = event_type.id
	GROUP BY childEvent.id
	ORDER BY LEAST(
		childEvent.date,
		lower(childEvent.date_range),
		lower(childEvent.date_range_uncertain),
		lower(childEvent.date_uncertain)
	);`;
	console.log(s);
	return s;
};

const selectRootSql = (slug) => `
	SELECT event.*, array_agg(event_type.title) AS types
	FROM event, event_type, event__event_type
	WHERE event.slug = '${slug}'
		AND event__event_type.event_id = event.id
		AND event__event_type.event_type_id = event_type.id
	GROUP BY event.id;`;

const selectParentEventsSql = (slug) => `
	SELECT parentEvent.*, array_agg(event_type.title) AS types
	FROM event as childEvent, event as parentEvent, event_type, event__event_type, event__event
	WHERE childEvent.slug = '${slug}'
		AND event__event.child_event_id = childEvent.id
		AND event__event.parent_event_id = parentEvent.id
		AND event__event_type.event_id = parentEvent.id
		AND event__event_type.event_type_id = event_type.id
	GROUP BY parentEvent.id;`;

const app = express();
app.use(bodyParser.json());

app.post('/events', (req, res) => {
	pool.connect((connectionError, client, releaseClient) => {
		if (connectionError) return console.error('Error fetching client from pool', connectionError);

		client.query(selectRootSql(req.body.event), (queryError1, result1) => {
			if (queryError1) return console.error('Error querying database', queryError1);

			client.query(sql(req.body.event), (queryError2, result2) => {
				if (queryError2) return console.error('Error querying database', queryError2);
				res.send({
					events: result2.rows.map(parseEvent),
					root: parseEvent(result1.rows[0]),
				});
				releaseClient();
			});
		});
	});
});

app.post('/parent-events', (req, res) => {
	pool.connect((connectionError, client, releaseClient) => {
		if (connectionError) return console.error('Error fetching client from pool', connectionError);

		client.query(selectParentEventsSql(req.body.event), (queryError, result) => {
			if (queryError) return console.error('Error querying database', queryError);

			res.send(result.rows.map(parseEvent));
			releaseClient();
		});
	});
});

app.post('/event-types', (req, res) => {
	pool.connect((connectionError, client, releaseClient) => {
		if (connectionError) return console.error('Error fetching client from pool', connectionError);

		client.query(`SELECT event_type.id as key, event_type.title as value, event_type.body FROM event_type WHERE event_type.title LIKE '%${req.body.query}%';`, (queryError, result) => {
			if (queryError) return console.error('Error querying database', queryError);

			res.send(result.rows);
			releaseClient();
		});
	});
});

pool.on('error', function (err, client) {
	// if an error is encountered by a client while it sits idle in the pool
	// the pool itself will emit an error event with both the error and
	// the client which emitted the original error
	// this is a rare occurrence but can happen if there is a network partition
	// between your application and the database, the database restarts, etc.
	// and so you might want to handle it and at least log it out
	// console.error('idle client error', err.message, err.stack);
});

const port = 3999;
app.listen(port, () => console.log(`Listening on port ${port}!`));

