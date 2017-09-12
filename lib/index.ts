import * as ts_module from "../node_modules/typescript/lib/tsserverlibrary";

function init(modules: {typescript: typeof ts_module}): ts.server.PluginModule {
    const ts = modules.typescript;

    function create(info: ts.server.PluginCreateInfo) {
        // Get a list of things to remove from the completion list from the config object.
        // If nothing was specified, we'll just remove 'caller'
        const whatToRemove: string[] = info.config.remove || ['caller'];

        // Diagnostic logging
        info.project.projectService.logger.info("This message will appear in your logfile if the plugin loaded correctly");

        // Set up decorator
   	    const proxy = Object.create(null) as ts.LanguageService;
	    const oldLS = info.languageService;
	    for (const k in oldLS) {
	        (<any>proxy)[k] = function () {
	            return oldLS[k].apply(oldLS, arguments);
	        }
        }

        function isOurs(f: string) {
            return /\.ngml$/.test(f);
        }
        
        // Remove specified entries from completion list
        proxy.getCompletionsAtPosition = (fileName, position): ts.CompletionInfo => {
            if (isOurs(fileName)) {
                info.project.projectService.logger.info(`Hacking up some stuff for the completion list in ${fileName}`);
                return {
                    isGlobalCompletion: true,
                    isMemberCompletion: false,
                    isNewIdentifierLocation: true,
                    entries: [
                        { kind: ts.ScriptElementKind.keyword, kindModifiers: "", name: "HELLO", sortText: "HELLO" }
                    ]
                };
            }

            const prior = info.languageService.getCompletionsAtPosition(fileName, position);
            if (prior === undefined) {
                return prior;
            }
            
            const oldLength = prior.entries.length;
            prior.entries = prior.entries.filter(e => whatToRemove.indexOf(e.name) < 0);

            prior.entries.forEach(e => e.name = e.name.toUpperCase());
            // Sample logging for diagnostic purposes
            if (oldLength !== prior.entries.length) {
                info.project.projectService.logger.info(`Removed ${oldLength - prior.entries.length} entries from the completion list`);
            }

            return prior;
        };

        proxy.getEncodedSemanticClassifications = (fileName, span): ts.Classifications => {
            if (isOurs(fileName)) return { endOfLineState: ts.EndOfLineState.None, spans: [] };
            return info.languageService.getEncodedSemanticClassifications(fileName, span);
        };

        proxy.getSemanticDiagnostics = (fileName) => {
            if (isOurs(fileName)) return [];
            return info.languageService.getSemanticDiagnostics(fileName);
        };

        proxy.getSyntacticDiagnostics = (fileName) => {
            if (isOurs(fileName)) return [];
            return info.languageService.getSyntacticDiagnostics(fileName);
        };

        proxy.getTodoComments = (fileName, d) => {
            if (isOurs(fileName)) return [];
            return info.languageService.getTodoComments(fileName, d);
        };

        proxy.getCompletionEntryDetails = (fileName, pos, name) => {
            if (isOurs(fileName)) {
                return {
                    displayParts: [],
                    documentation: [],
                    kind: ts.ScriptElementKind.memberFunctionElement,
                    kindModifiers: ts.ScriptElementKindModifier.none,
                    name: name,
                    tags: []
                }
            }
            return info.languageService.getCompletionEntryDetails(fileName, pos, name);
        };

        proxy.getDocumentHighlights = (fileName, pos, files) => {
            if (isOurs(fileName)) return [];
            return info.languageService.getDocumentHighlights(fileName, pos, files);
        };

        proxy.getApplicableRefactors = (fileName, pos) => {
            if (isOurs(fileName)) return [];
            return info.languageService.getApplicableRefactors(fileName, pos)           ;
        };
        
        return proxy;
    }

    function getExternalFiles(proj: ts.server.Project): string[] {
        const result = (proj.getFileNames(undefined, undefined, true) as string[]).filter(f => f.indexOf("file1.ts") > 0).map(f => f.replace("file1.ts", "file1.ngml"));
        proj.projectService.logger.info(`Transformed ${proj.getFileNames(undefined, undefined, true)} => ${result} in getExternalFiles`);
        return result;
    }

    return { create, getExternalFiles };
}

export = init;
