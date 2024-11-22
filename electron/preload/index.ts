import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  initOPCUA: (message) => ipcRenderer.send('initOPCUA', message),
  onInitOPCUAResponse: (callback) => ipcRenderer.on('initOPCUA_response', (event, arg) => callback(arg)),

  saveOPCUA: (message) => ipcRenderer.send('saveOPCUA', message),
  onSaveOPCUAResponse: (callback) => ipcRenderer.on('saveOPCUA_response', (event, arg) => callback(arg)),

  loadOPCUA: (message) => ipcRenderer.send('loadOPCUA', message),
  onLoadOPCUAResponse: (callback) => ipcRenderer.on('loadOPCUA_response', (event, arg) => callback(arg)),

  startOPCUA: (message) => ipcRenderer.send('startOPCUA', message),
  onStartOPCUAResponse: (callback) => ipcRenderer.on('startOPCUA_response', (event, arg) => callback(arg)),

  closeOPCUA: (message) => ipcRenderer.send('closeOPCUA', message),
  onCloseOPCUAResponse: (callback) => ipcRenderer.on('closeOPCUA_response', (event, arg) => callback(arg)),
  
  updateOPCUA: (message) => ipcRenderer.send('updateOPCUA', message),
  onUpdateOPCUAResponse: (callback) => ipcRenderer.on('updateOPCUA_response', (event, arg) => callback(arg)),
  
  pollingOPCUA: (message) => ipcRenderer.send('pollingOPCUA', message),
  onPollingOPCUAResponse: (callback) => ipcRenderer.on('pollingOPCUA_response', (event, arg) => callback(arg)),


  saveModbus: (message) => ipcRenderer.send('saveModbus', message),
  onSaveModbusResponse: (callback) => ipcRenderer.on('saveModbus_response', (event, arg) => callback(arg)),

  loadModbus: (message) => ipcRenderer.send('loadModbus', message),
  onLoadModbusResponse: (callback) => ipcRenderer.on('loadModbus_response', (event, arg) => callback(arg)),

  startModbus: (message) => ipcRenderer.send('startModbus', message),
  onStartModbusResponse: (callback) => ipcRenderer.on('startModbus_response', (event, arg) => callback(arg)),

  closeModbus: (message) => ipcRenderer.send('closeModbus', message),
  onCloseModbusResponse: (callback) => ipcRenderer.on('closeModbus_response', (event, arg) => callback(arg)),
  
  updateModbus: (message) => ipcRenderer.send('updateModbus', message),
  onUpdateModbusResponse: (callback) => ipcRenderer.on('updateModbus_response', (event, arg) => callback(arg)),
  
  pollingModbus: (message) => ipcRenderer.send('pollingModbus', message),
  onPollingModbusResponse: (callback) => ipcRenderer.on('pollingModbus_response', (event, arg) => callback(arg)),

  saveMC: (message) => ipcRenderer.send('saveMC', message),
  onSaveMCResponse: (callback) => ipcRenderer.on('saveMC_response', (event, arg) => callback(arg)),

  loadMC: (message) => ipcRenderer.send('loadMC', message),
  onLoadMCResponse: (callback) => ipcRenderer.on('loadMC_response', (event, arg) => callback(arg)),

  startMC: (message) => ipcRenderer.send('startMC', message),
  onStartMCResponse: (callback) => ipcRenderer.on('startMC_response', (event, arg) => callback(arg)),

  closeMC: (message) => ipcRenderer.send('closeMC', message),
  onCloseMCResponse: (callback) => ipcRenderer.on('closeMC_response', (event, arg) => callback(arg)),
  
  updateMC: (message) => ipcRenderer.send('updateMC', message),
  onUpdateMCResponse: (callback) => ipcRenderer.on('updateMC_response', (event, arg) => callback(arg)),
  
  pollingMC: (message) => ipcRenderer.send('pollingMC', message),
  onPollingMCResponse: (callback) => ipcRenderer.on('pollingMC_response', (event, arg) => callback(arg)),
  
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})
contextBridge.exposeInMainWorld('electron', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
});

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999)
