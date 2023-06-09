// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	typescript: {
		strict: true,
		typeCheck: true,
	},
	modules: ['@nuxtjs/eslint-module'],
	eslint: {
		lintOnStart: false,
	},
	css: [
		'vuetify/lib/styles/main.sass',
		'@mdi/font/css/materialdesignicons.min.css',
	],
	build: {
		transpile: ['vuetify'],
	},
	ssr: false,
});
