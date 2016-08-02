import * as express from 'express';
import * as pg from 'pg';

const pool = new pg.Pool({
	database: 'timeline',
	host: 'db',
	idleTimeoutMillis: 30000,
	max: 10,
	password: 'docker',
	port: 5432,
	user: 'docker',
});
//
// pool.connect((err, client, done) => {
// 	console.log(err)
// 	client.query('SELECT * FROM events', (err2, result) => {
// 		console.log(err2)
// 		console.log(result)
// 	})
// })



const app = express();

app.post('/api/events', (req, res) => {
	res.send('Hello world');
})

app.listen(3001, () => console.log('Listening on port 3001!'));
