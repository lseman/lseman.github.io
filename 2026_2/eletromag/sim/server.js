const http = require("http");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const option = (name) => {
	const index = args.indexOf(`--${name}`);
	const inline = args.find((arg) => arg.startsWith(`--${name}=`));
	return inline ? inline.slice(name.length + 3) : index >= 0 ? args[index + 1] : undefined;
};
const host = option("host") || process.env.HOST || "0.0.0.0";
const requestedPort = Number(option("port") || process.env.PORT || 8765);
const portWasExplicit = option("port") !== undefined || process.env.PORT !== undefined;
if (!Number.isInteger(requestedPort) || requestedPort < 1 || requestedPort > 65535) {
	console.error(`Porta inválida: ${requestedPort}`);
	process.exit(1);
}

const MIME = {
	".html": "text/html",
	".js": "application/javascript",
	".css": "text/css",
	".png": "image/png",
	".jpg": "image/jpeg",
	".svg": "image/svg+xml",
	".json": "application/json",
};

const server = http.createServer((req, res) => {
		const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
		const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
		const fp = path.resolve(__dirname, relative);
		if (fp !== __dirname && !fp.startsWith(`${__dirname}${path.sep}`)) {
			res.statusCode = 403;
			res.end("Forbidden");
			return;
		}
		const ext = path.extname(fp);
		res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
		res.setHeader("Pragma", "no-cache");
		res.setHeader("Expires", "0");
		res.setHeader("Content-Type", MIME[ext] || "text/plain");
		fs.readFile(fp, (err, data) => {
			if (err) {
				res.statusCode = 404;
				res.end("Not found");
				return;
			}
			res.end(data);
		});
	});

let activePort = requestedPort;
server.on("error", (error) => {
	if (error.code === "EADDRINUSE" && !portWasExplicit && activePort < requestedPort + 10) {
		const previous = activePort++;
		console.warn(`Porta ${previous} ocupada; tentando ${activePort}…`);
		setTimeout(() => server.listen(activePort, host), 30);
		return;
	}
	if (error.code === "EADDRINUSE") {
		console.error(`A porta ${activePort} já está em uso. Use --port ${activePort + 1} ou defina PORT=${activePort + 1}.`);
	} else if (error.code === "EACCES") {
		console.error(`Sem permissão para escutar em ${host}:${activePort}.`);
	} else {
		console.error(error);
	}
	process.exitCode = 1;
});
server.on("listening", () => {
	const displayHost = host === "0.0.0.0" || host === "::" ? "localhost" : host;
	console.log(`EM Lab: http://${displayHost}:${activePort}`);
	if (host === "0.0.0.0") console.log(`Rede: http://<IP-DESTA-MÁQUINA>:${activePort}`);
});
server.listen(activePort, host);
