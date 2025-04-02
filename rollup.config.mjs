import css from 'rollup-plugin-css-only';
import htmlTemplate from 'rollup-plugin-generate-html-template';
import serve from 'rollup-plugin-serve';

export default {
	input: 'src/main.js',
	output: {
		dir: "dist",
		// format: "iife",
		// inlineDynamicImports: true
		format: "esm",
	},
	plugins: [
		css(),
		htmlTemplate({
			template: 'webpack/index.html',
		}),		
		serve({
			open: true,
			contentBase:'dist'
		})
	  ],
};