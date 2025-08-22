const { app, BrowserWindow } = require('electron')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800
  })

  win.loadURL('http://localhost:5000');
  win.setMenu(null);
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// 引入 python-shell 模块
const { PythonShell } = require('python-shell');

// 配置 Python 脚本路径和选项
let options = {
mode: 'text',
pythonPath: '../.venv/bin/python3', // 替换为你的 Python 路径
scriptPath: '../', // Python 脚本所在目录
};

// 执行 Python 脚本
PythonShell.run('server.py', options, (err, results) => {
if (err) throw err;
});