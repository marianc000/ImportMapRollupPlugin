const path = require('path');

const workingDir = process.cwd();

function toAbsolutePath(relativePath) {
    return path.resolve(workingDir, relativePath);
}

function ImportmapPlugin({ imports }) {

    const moduleMap = {};
    const packageMap = {};

    Object.entries(imports).forEach(([key, path]) => {
        if (key.endsWith('/')) moduleMap[key] = path;
        else packageMap[key] = path;
    });

    return {
        name: 'rollup-plugin-importmap',

        async buildStart(options) {
            console.log("using imports:", imports);
            console.log("moduleMap:", moduleMap);
            console.log("packageMap:", packageMap);
        },

        resolveId(source, importer) {
            const path = moduleMap[source];
            if (path) return  toAbsolutePath(path);

            const key = Object.keys(imports).find(key => source.startsWith(key));
            if (key)
                return  toAbsolutePath(source.replace(key, imports[key]));

            return null; 
        }
    };
}

module.exports = ImportmapPlugin;
