# External Files Walkthrough

This repo augments the existing https://github.com/RyanCavanaugh/sample-ts-plugin repo to demonstrate how to deal with *external files* when writing TypeScript extensions.

An *external file* is a file that isn't a TypeScript or JavaScript file, but has handling available from a Language Service Plugin such that it can be used in conjuction with TS or JS files.
One example is an Angular 2 template file, which can offer a similar editing experience to a TypeScript file, e.g. completions, errors, and quick info.

# Writing an External-File-Providing Plugin

Plugins that want to provide external files need to do the following:
 * Implement the `getExternalFiles` method
 * Fully intercept (rather than passing through) calls to your files

# `getExternalFiles`

The function `getExternalFiles` takes a `ts.Program` and returns a list of filenames that should be considered part of the program.
This function is called *very* frequently and so should be as fast as possible.
Your plugin should not add additional `.ts`, `.d.ts`, `.js`, or other files -- only files which don't affect typechecking should be returned here.

# Integrating with Visual Studio

To add support for Visual Studio, you'll need to contact the TypeScript team to add your file extension to the Visual Studio package.
We'll need the following information:
 * The file extension(s). This *cannot* be a file extension currently supported by Visual Studio
 * The TextMate grammar to use for the file (assuming you want colorization). This can be an existing grammar supported by Visual Studio, or an appropriately-licensed grammar provided by you
  * A description of the framework this file extension is used with. Currently we can only support extensions which have reasonably-large user bases (in other words, we should probably have already heard of whatever it is this file is being used for)

# More Information

See the base repo https://github.com/RyanCavanaugh/sample-ts-plugin for more information on writing plugins.

# Real-world Plugins

Some other TypeScript Language Service Plugin implementations you can look at for reference:
* https://github.com/angular/angular/blob/master/modules/%40angular/language-service/src/ts_plugin.ts
