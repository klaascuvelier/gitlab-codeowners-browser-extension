const { createBuilder } = require('@angular-devkit/architect');
const { executeBrowserBuilder } = require('@angular-devkit/build-angular');
const { tap, from, switchMap, forkJoin, map, Observable } = require('rxjs');
const { writeFile, readdir, readFile } = require('node:fs/promises');
const { join } = require('node:path');
const { exec } = require('node:child_process');
const { combineOptionsForExecutor } = require('nx/src/utils/params');

const chromeExtensionBuilder = (options, context) => {
    return executeBrowserBuilder(options, context).pipe(
        switchMap((result) => createManifest(options, result)),
        switchMap(() => createServiceWorker(options)),
        switchMap(() => createContentFile(options)),
        map(() => {
            return { success: true };
        })
    );
};

exports.chromeExtensionBuilder = chromeExtensionBuilder;
exports.default = createBuilder(chromeExtensionBuilder);

function createManifest(options) {
    const packageJsonPath = join(__dirname, '../..', 'package.json');
    const manifestPath = join(options.outputPath, 'manifest.json');
    const packageJsonVersion = require(packageJsonPath).version;
    const extensionDetails = options.extensionDetails ?? {};

    const manifestContent = {
        manifest_version: extensionDetails.version,
        name: extensionDetails.name,
        description: extensionDetails.description,
        version: packageJsonVersion,
        permissions: extensionDetails.permissions,
        host_permissions: extensionDetails.host_permissions,
        web_accessible_resources: extensionDetails.web_accessible_resources,
        action: {
            default_popup: 'index.html',
        },
        background: {
            service_worker: extensionDetails.background.service_worker.output,
            type: extensionDetails.background.type,
        },
    };

    return from(
        writeFile(manifestPath, JSON.stringify(manifestContent, null, 2))
    ).pipe(tap(() => console.log('✅ Wrote manifest.json')));
}

function createContentFile(options) {
    const swSourcePath = join(
        options.main,
        '..',
        options.extensionDetails.content.input
    );
    const swOutputPath = join(
        options.outputPath,
        options.extensionDetails.content.output
    );

    return bundleScript(swSourcePath, swOutputPath);
}

function createServiceWorker(options) {
    const swSourcePath = join(
        options.main,
        '..',
        options.extensionDetails.background.service_worker.input
    );
    const swOutputPath = join(
        options.outputPath,
        options.extensionDetails.background.service_worker.output
    );

    return bundleScript(swSourcePath, swOutputPath);
}

function bundleScript(input, output) {
    return new Observable((observer) => {
        exec(`npx esbuild ${input} --bundle --outfile=${output}`, (err) => {
            if (err) {
                observer.error(err);
                observer.complete();
            } else {
                console.log(`✅ Wrote ${output}`);
                observer.next();
                observer.complete();
            }
        });
    });
}
