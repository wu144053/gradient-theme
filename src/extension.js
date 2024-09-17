const path = require('path')
const fs = require('fs')
const vscode = require('vscode')

const config = {
  extensionName: 'shaobeichen.gradient-theme',
  tagAttr: 'data-gradient-theme-id',
}

function isVSCodeBelowVersion(version) {
  const vscodeVersion = vscode.version
  const vscodeVersionArray = vscodeVersion.split('.')
  const versionArray = version.split('.')
  return versionArray.some((item, index) => vscodeVersionArray[index] < item)
}

function showReloadMessage(message) {
  vscode.window
    .showInformationMessage(message, { title: 'Restart editor to complete' })
    .then(function (msg) {
      vscode.commands.executeCommand('workbench.action.reloadWindow')
    })
}

const isWin = /^win/.test(process.platform)
const appDir = path.dirname(require.main.filename)
const base = appDir + (isWin ? '\\vs\\code' : '/vs/code')
const electronBase = isVSCodeBelowVersion('1.70.0') ? 'electron-browser' : 'electron-sandbox'
const htmlFile =
  base +
  (isWin
    ? '\\' + electronBase + '\\workbench\\workbench.html'
    : '/' + electronBase + '/workbench/workbench.html')

const enableCommonMessage = `VS code must reload for this change to take effect. Code may display a warning that it is corrupted, this is normal. You can dismiss this message by choosing 'Don't show this again' on the notification.`

const prefix = 'extension'
const enableName = 'enable'
const disableName = 'disable'
const enableCommand = prefix + '.' + enableName
const disableCommand = prefix + '.' + disableName

const enableMessage = 'Gradient ' + enableName + 'd. ' + enableCommonMessage
const disableMessage = 'Gradient ' + disableName + 'd. ' + enableCommonMessage

const tagAttr = config.tagAttr

function reset() {
  const html = fs.readFileSync(htmlFile, 'utf-8')
  const regex = new RegExp(
    `<style[^>]*${tagAttr}[^>]*>.*?</style>|<script[^>]*${tagAttr}[^>]*>.*?</script>`,
    'gs',
  )
  const output = html.replace(regex, '')
  fs.writeFileSync(htmlFile, output, 'utf-8')
}

function install() {
  reset()

  const distIndexHtmlFile = path.join(__dirname, '../dist/index.html')

  const html = fs.readFileSync(htmlFile, 'utf-8')
  const styleHtml = fs.readFileSync(distIndexHtmlFile, 'utf-8')

  fs.writeFileSync(htmlFile, html + styleHtml, 'utf-8')

  showReloadMessage(enableMessage)
}

function uninstall() {
  reset()

  showReloadMessage(disableMessage)
}

function registerCommand(context) {
  const disposable = vscode.commands.registerCommand(enableCommand, install)
  const disable = vscode.commands.registerCommand(disableCommand, uninstall)
  context.subscriptions.push(disposable)
  context.subscriptions.push(disable)
}

function activate(context) {
  this.extensionName = config.extensionName
  this.cntx = context

  registerCommand(context)
}

exports.activate = activate

function deactivate() {
  reset()
}

module.exports = {
  activate,
  deactivate,
}
