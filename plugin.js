const path = require('path');
const { readFileSync } = require('fs');

const workingDir = process.cwd();

function toAbsolutePath(relativePath) {
    return path.resolve(workingDir, relativePath);
}
 
function ImportmapPlugin({ imports } = { imports: [] }) {
    let cache;

    console.log("XXX esmImportToUrl", workingDir, imports);
    return {
        name: 'rollup-plugin-importmap',

        async buildStart(options) {
            console.log(">buildStart found imports:", imports);
            cache = new Map(Object.entries(imports));
            console.log("cache", cache);
        },

        resolveId(source, importer) {
            // console.log("XXX resolveId", source, importer);
            const url = cache.get(source);
            if (url) {
                return toAbsolutePath(url);
            } else {
                const entry = Array.from(cache).find(([key, val]) => source.startsWith(key)
                    && source.length > key.length);
                if (entry) {
                    const [key, val] = entry;
                    const r = toAbsolutePath(source.replace(key, val));
                    //  console.log("found", key, val, source, '=>', r);
                    return r;
                }
            }
            return null;
        },

        // load (id){
        //     if (id.includes('dataHolder'))
        //      console.log("---------------------",id);
        //    // else console.log("---",id);
        //     return null;
        // },

        resolveImportMeta(property, obj) {

            // console.log("XXX resolveImportMeta",property, obj,normalizePath(athN.relative(workingDir, obj.moduleId)));
            return null;
        },

        transform(code, id) {
            const re = /await +loadHTML\('([^,]+)',/g;
            const reSpacesBetweenTags = />[ \n]+</g;
            const reComments = /<!--.*?-->/sg;

            function replacer(match, relativeUrl) {
                const filePath = path.resolve(path.dirname(id), relativeUrl);
                let html = readFileSync(filePath, { encoding: 'utf8' });
                html = html.replace(reSpacesBetweenTags, '><').replace(reComments, '');
                
                return JSON.stringify(html) + "; //";
            }

            return code.replace(re, replacer);
        }

    };
}

module.exports = ImportmapPlugin;
