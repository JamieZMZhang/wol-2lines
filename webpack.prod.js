const webpack = require('webpack');
const path = require('path');
const configDev = require('./webpack.dev');

module.exports = {
	...configDev,
	mode: 'production',
};