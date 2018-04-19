"use strict";

if(atom.getLoadSettings().headless){
	const {stdout, stderr} = require("electron").remote.process;
	const {inspect} = require("util");
	const patches = [
		[stdout, ["log", "info", "dir", "dirxml"]],
		[stderr, ["error", "warn"]],
	];
	for(const [stream, methods] of patches){
		const log = (...args) => {
			for(const arg of args)
				stream.write("object" === typeof arg ? inspect(arg) : String(arg));
			stream.write("\n");
		};
		for(const fn of methods)
			console[fn] = log;
	}
}

const argv = Object.create(null);
for(const flag of process.env.ARGV_HACK.split(/(?:^|\s)(?=--[^\s-])/))
	if(/^\s*--([^\s-=][^\s=]+)(?:=([^=\s]*))?/.test(flag))
		argv[RegExp.$1] = RegExp.$2;


// Everything below is case-specific
const fs   = require("fs");
const path = require("path");
const CWD  = process.cwd();

argv.files = (argv.files || "").split(":").map(file => {
	file = path.resolve(path.join(CWD, file));
	try{ file = fs.realpathSync(file); }
	catch(e){ return null; }
	return file;
}).filter(Boolean);

describe("Updating scope snapshots", () => {
	it("", async () => {
		waitsForPromise(async () => {
			const root = path.resolve(__dirname, "..");
			atom.packages.loadPackage(root);
			await atom.packages.activatePackage(root);
		});
		
		runs(() => {
			const JS = atom.grammars.grammarForScopeName("source.ecmascript");
			for(const file of argv.files){
				console.log(`Updating: ${tildify(file)}`);
				const data = fs.readFileSync(file).toString();
				const lines = JSON.stringify(JS.tokenizeLines(data), null, "\t");
				fs.writeFileSync(`${file}.json`, lines);
			}
		});
	});
});


function tildify(input){
	const $HOME = require("os").homedir();
	const regex = new RegExp("^" + $HOME.replace(/([/\\^$*+?{}\[\]().|])/g, "\\$1"));
	return input.replace(regex, "~");
}
