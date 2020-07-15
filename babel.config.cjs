module.exports = {
	presets: ['@babel/typescript'],
	plugins: [
		'@babel/plugin-proposal-optional-chaining',
		'@babel/plugin-proposal-nullish-coalescing-operator',
		'@babel/plugin-transform-modules-commonjs',
		'@babel/plugin-proposal-class-properties',
		'@babel/plugin-proposal-numeric-separator',
		'@babel/plugin-syntax-dynamic-import',
		'@babel/plugin-proposal-dynamic-import',
	],
}
