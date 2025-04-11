// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const watcher = vscode.workspace.createFileSystemWatcher('**/*.model.json');
	const path = require("path");
	const sound = require('sound-play');
	const soundPath = vscode.Uri.joinPath(context.extensionUri, 'bank_001.ogg').fsPath;
	sound.play(soundPath);
	

	vscode.window.showInformationMessage(`Watcher initialized`);
	watcher.onDidCreate(async(uri) => {
		const filePath = uri.fsPath;
		const fileName = path.basename(filePath);
		const dir = path.dirname(filePath);
		vscode.window.showInformationMessage(`Watcher started`);

		const match = fileName.match(/^(.*)\.([^.]+)\.model\.json$/);
		if(!match) { vscode.window.showInformationMessage(`file wasn't a match`); return;};
		const baseName = match[1]; // "File"
		const className = match[2]; // "RemoteEvent"
		const newFileName =  `${baseName}.model.json`;
		const newFilePath = path.join(dir, newFileName);
		
		// writing the json table
		const jsonData = {
			ClassName: className
		};

		fs.writeFileSync(filePath, JSON.stringify(jsonData , null, 4));

		setTimeout(() => {
			fs.rename(filePath, newFilePath, async (err) => {
				if (err) {
					vscode.window.showErrorMessage('FAILED RENAME: ${err.message}');
				} else {
					vscode.window.showInformationMessage(`RENAMED: ${newFileName}`);

					const oldDoc = vscode.workspace.textDocuments.find(doc => doc.fileName === filePath);
					if (oldDoc){
						await vscode.window.showTextDocument(oldDoc);
						await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
					}

					const newDoc = await vscode.workspace.openTextDocument(newFilePath);
					await vscode.window.showTextDocument(newDoc);
					vscode.window.showInformationMessage(`Created and renamed to ${newFileName}`);

				}
			});
		});
	}, 200);
	context.subscriptions.push(watcher);
}

// This method is called when your extension is deactivated
export function deactivate() {}
