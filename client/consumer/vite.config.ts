import { pages } from "vike-cloudflare";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import devServer from "@hono/vite-dev-server";
import telefunc from "telefunc/vite";
import { defineConfig } from "vite";
import vike from "vike/plugin";

export default defineConfig({
	plugins: [
		vike(),
		devServer({
			entry: "hono-entry.ts",

			exclude: [
				/^\/@.+$/,
				/.*\.(ts|tsx|vue)($|\?)/,
				/.*\.(s?css|less)($|\?)/,
				/^\/favicon\.ico$/,
				/.*\.(svg|png)($|\?)/,
				/^\/(public|assets|static)\/.+/,
				/^\/node_modules\/.*/,
			],

			injectClientScript: false,
		}),
		react({}),
		tailwindcss(),
		telefunc(),
		pages({
			server: {
				kind: "hono",
				entry: "hono-entry.ts",
			},
		}),
	],
	build: {
		target: "es2022",
	},
});
