all: redis app

redis:
	redis-server --daemonize yes

app:
	npm run worker & npm start
