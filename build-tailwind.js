#!/usr/bin/env node
const postcss = require("postcss");
const tailwind = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const fs = require("fs");

postcss([tailwind("./tailwind.config.js"), autoprefixer()])
	.process("@tailwind utilities;", { from: undefined })
	.then((result) => {
		fs.writeFileSync("assets/css/tailwind-output.css", result.css);
		console.log(
			`Generated tailwind-output.css (${(result.css.length / 1024).toFixed(1)} KB)`,
		);
	})
	.catch((err) => {
		console.error("Build failed:", err);
		process.exit(1);
	});
