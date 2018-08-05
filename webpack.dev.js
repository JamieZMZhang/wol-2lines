const webpack = require('webpack');
const path = require('path');

module.exports = {
	mode: 'development',
	entry: './src/index.ts',
	resolve: {
		extensions: [
			'.ts',
			'.tsx',
			'.js',
			'.json',
		],
	},
	module: {
		rules: [{
				test: /\.tsx?$/,
				loader: "ts-loader"
			},
			{
				test: /\.(scss|css)$/,

				use: [{
						loader: 'raw-loader'
					},
					{
						loader: 'sass-loader',

						options: {
							sourceMap: true
						}
					}
				]
			}
		]
	},
};