const path= require('path');

module.exports = {
	entry: './src/game/Game.ts',

	experiments: {
		outputModule: true,
	  },

	output: {
		filename: 'gamer2d.js',
		// chunkFilename: '[name].[chunkhash].js',
		path: path.resolve(__dirname, '../dist'),
		clean: true,
		library: {
			type: "module"
		},
	},

	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			}		  		  
		],
	  },

	  resolve: {
		extensions: ['.ts', '.js'],
	  },
	
};