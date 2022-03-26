import http from 'http';
import { createApp } from './app';
import config from './config';

const app = createApp();
http.createServer(app.callback()).listen(config.http.port);
