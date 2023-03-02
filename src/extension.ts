'use strict';
import * as vscode from 'vscode';
import ZigCompilerProvider from './zigCompilerProvider';
import { zigBuild } from './zigBuild';
import { ZigFormatProvider, ZigRangeFormatProvider } from './zigFormat';
import { activate as activateZls, deactivate as deactivateZls } from './zls';

const ZIG_MODE: vscode.DocumentFilter = { language: 'zig', scheme: 'file' };

export let buildDiagnosticCollection: vscode.DiagnosticCollection;
export const logChannel = vscode.window.createOutputChannel('zig');
export const zigFormatStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

export function activate(context: vscode.ExtensionContext) {
    let compiler = new ZigCompilerProvider();
    compiler.activate(context.subscriptions);
    vscode.languages.registerCodeActionsProvider('zig', compiler);

    context.subscriptions.push(logChannel);

    if (vscode.workspace.getConfiguration("zig").get<string>("formattingProvider", "zls") === "extension") {
        context.subscriptions.push(
            vscode.languages.registerDocumentFormattingEditProvider(
                ZIG_MODE,
                new ZigFormatProvider(logChannel),
            ),
        );
        context.subscriptions.push(
            vscode.languages.registerDocumentRangeFormattingEditProvider(
                ZIG_MODE,
                new ZigRangeFormatProvider(logChannel),
            ),
        );
    }

    buildDiagnosticCollection = vscode.languages.createDiagnosticCollection('zig');
    context.subscriptions.push(buildDiagnosticCollection);

    // Commands
    context.subscriptions.push(vscode.commands.registerCommand('zig.build.workspace', () => zigBuild()));

    activateZls(context);
}

export function deactivate() {
    deactivateZls();
}
