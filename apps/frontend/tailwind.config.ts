import type { Config } from "tailwindcss";

export default {
	content: ["./app/**/*.{js,jsx,ts,tsx}"],
	theme: {
		fontFamily: {
			bespokeBold: ["BespokeSerif-Bold", "sans-serif"],
		},
		colors: {
			primaryColor: "#27638A",
		},
		extend: {},
	},
	plugins: [],
} satisfies Config;
