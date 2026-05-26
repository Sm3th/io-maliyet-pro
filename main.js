const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    title: 'IO Software — Maliyet Pro',
    backgroundColor: '#0f172a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    titleBarStyle: 'default',
    show: false,
  });

  win.loadFile('index.html');

  win.once('ready-to-show', () => {
    win.show();
  });

  // Application menu
  const template = [
    {
      label: 'Dosya',
      submenu: [
        {
          label: 'Yeni Proje',
          accelerator: 'CmdOrCtrl+N',
          click: () => win.webContents.executeJavaScript('app.yeniProje()'),
        },
        {
          label: 'Kaydet',
          accelerator: 'CmdOrCtrl+S',
          click: () => win.webContents.executeJavaScript('app.kaydet()'),
        },
        {
          label: 'JSON Yedek Al',
          click: () => win.webContents.executeJavaScript('app.yedekal()'),
        },
        {
          label: 'JSON Yedek Yükle',
          click: () => win.webContents.executeJavaScript('app.yedekYukle()'),
        },
        { type: 'separator' },
        {
          label: 'Çıkış',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Düzenle',
      submenu: [
        { role: 'undo', label: 'Geri Al' },
        { role: 'redo', label: 'İleri Al' },
        { type: 'separator' },
        { role: 'cut', label: 'Kes' },
        { role: 'copy', label: 'Kopyala' },
        { role: 'paste', label: 'Yapıştır' },
      ],
    },
    {
      label: 'Görünüm',
      submenu: [
        { role: 'togglefullscreen', label: 'Tam Ekran' },
        { role: 'toggleDevTools', label: 'Geliştirici Araçları' },
      ],
    },
    {
      label: 'Hakkında',
      submenu: [
        {
          label: 'IO Software — Maliyet Pro v2.0',
          enabled: false,
        },
        { type: 'separator' },
        {
          label: 'IO Software Web Sitesi',
          click: () => shell.openExternal('https://iosoftware.dev'),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
