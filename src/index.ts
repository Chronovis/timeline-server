import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as pg from 'pg';
import * as slug from 'slug';

const pool = new pg.Pool({
	database: 'timeline',
	host: 'db',
	idleTimeoutMillis: 3000,
	max: 10,
	password: 'docker',
	port: 5432,
	user: 'docker',
});

// pool.connect((err, client, done) => {
// 	console.log(err)
// 	client.query('SELECT * FROM events', (err2, result) => {
// 		console.log(err2)
// 		console.log(result)
// 	})
// })
const sql = (event) => {
	const s = `
	SELECT childEvent.*, array_agg(event_type.title) AS types
	FROM event as childEvent, event as parentEvent, event__event, event_type, event__event_type
	WHERE event__event.parent_event_id = parentEvent.id
		AND event__event.child_event_id = childEvent.id
		AND parentEvent.slug = '${event}'
		AND event__event_type.event_id = childEvent.id
		AND event__event_type.event_type_id = event_type.id
	GROUP BY childEvent.id;
	`;
	console.log(s)
	return s;
}

const app = express();
app.use(bodyParser.json());

const staticDir = `${process.cwd()}/node_modules/timeline-client/dist/`;
app.use(express.static(staticDir));
app.get('*', (req, res) => res.sendFile(`${staticDir}index.html`));

app.post('/api/events', (req, res) => {
	pool.connect((connectionError, client, releaseClient) => {
		if (connectionError) return console.error('Error fetching client from pool', connectionError);

		client.query(`SELECT * FROM event WHERE event.slug = '${req.body.event}'`, (queryError1, result1) => {
			if (queryError1) return console.error('Error querying database', queryError1);

			client.query(sql(req.body.event), (queryError2, result2) => {
				if (queryError2) return console.error('Error querying database', queryError2);
				res.send({
					parent: result1.rows[0],
					children: result2.rows,
				});
				releaseClient();
			});
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
  console.error('idle client error', err.message, err.stack);
});

app.listen(3001, () => console.log('Listening on port 3001!'));
