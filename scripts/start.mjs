import './build.mjs';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const args=process.argv.slice(2),option=(key,fallback)=>{const index=args.indexOf(key);return index<0?fallback:args[index+1];};
const server=spawn('python3',['-m','http.server',option('--port',process.env.PORT||'8000'),'--bind',option('--host','127.0.0.1'),'--directory',fileURLToPath(new URL('../dist',import.meta.url))],{stdio:'inherit'});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.kill(signal));
server.on('exit',code=>process.exit(code??1));
