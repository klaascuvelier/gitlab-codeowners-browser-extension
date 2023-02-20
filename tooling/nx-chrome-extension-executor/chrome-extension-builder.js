const { writeFile, mkdir, copyFile } = require('node:fs/promises');
const { join } = require('node:path');
const { exec } = require('node:child_process');
const { createBuilder } = require('@angular-devkit/architect');
const {
    webpackExecutor,
} = require('@nrwl/node/src/executors/webpack/webpack.impl.js');

async function chromeExtensionBuilder(options, context) {
    context.logger.info('🚀 Building Chrome Extension');

    await mkdir(options.outputPath, { recursive: true });
    await Promise.all([
        createManifest(options),
        createServiceWorker(options),
        createScripts(options),
        createScreens(options),
    ]);

    return { success: true };
}

exports.chromeExtensionBuilder = chromeExtensionBuilder;
exports.default = createBuilder(chromeExtensionBuilder);

async function createManifest(options) {
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
        content_security_policy: extensionDetails.content_security_policy,
        web_accessible_resources: extensionDetails.web_accessible_resources,
        action: {
            default_popup: 'config.html',
        },
        background: {
            service_worker: extensionDetails.background.service_worker.output,
            type: extensionDetails.background.type,
        },
    };

    return writeFile(
        manifestPath,
        JSON.stringify(manifestContent, null, 2)
    ).then(() => console.log('✅ Wrote manifest.json'));
}

async function createScripts(options) {
    return await Promise.all(
        options.extensionDetails.scripts.map((script) => {
            const swSourcePath = join(options.main, '..', script.input);
            const swOutputPath = join(options.outputPath, script.output);

            return bundleScript(swSourcePath, swOutputPath);
        })
    );
}

async function createServiceWorker(options) {
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

async function createScreens(options) {
    return Promise.all(
        options.extensionDetails.screens.map((screen) => {
            const screenSourcePath = join(options.main, '..', screen);
            const screenOutputPath = join(options.outputPath, screen);

            return copyFile(screenSourcePath, screenOutputPath).then(() =>
                console.log(`✅ Wrote ${screen}`)
            );
        })
    );
}

function bundleScript(input, output) {
    return new Promise((resolve, reject) => {
        exec(
            `npx esbuild ${input} --bundle  --outfile=${output} --platform=browser`,

            (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(`✅ Wrote ${output}`);
                    resolve();
                }
            }
        );
    });
}
