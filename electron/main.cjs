const { app, BrowserWindow } = require('electron')
const path = require('node:path')

/** 桌面端固定窗口尺寸（16:9 演示比例） */
const WINDOW_WIDTH = 1440
const WINDOW_HEIGHT = 810

function createWindow() {
  const win = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: 1024,
    minHeight: 576,
    autoHideMenuBar: true,
    backgroundColor: '#180604',
    title: 'eFootball 抽卡模拟器',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.setMenuBarVisibility(false)
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  app.quit()
})
