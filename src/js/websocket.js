let stomp = null
let ws = null
let timer = null
let userName = null
let url = null
let subscribeUrl = null
let pointList = []
let timeList = []
let srcId = null
let pageName = null
let dataMap=null

function mainFunction (SrcId, PageName, lstpoint, lsttime) {
  srcId = SrcId
  pageName = PageName
  pointList = lstpoint
  timeList = lsttime
  userName = srcId + '@' + pageName
  var baseUrl = 'http://localhost:8189'     //测试
  url = baseUrl + '/stomp?name=' + userName
  subscribeUrl = '/topic/response/' + userName
  connected()
  this.check()
}

function connected () {
  var headers = {}
  ws = new SockJS(url) // 连接SockJS
  stomp = Stomp.over(ws)
  stomp.heartbeat.outgoing = 20000 // 若使用STOMP 1.1 版本，默认开启了心跳检测机制（默认值都是10000ms）
  stomp.heartbeat.incoming = 0 // 客户端不从服务端接收心跳包
  stomp.debug = null // 关闭debug日志
  stomp.connect(headers, connectCallback, errorCallback)
}

var self=this
function connectCallback (frame) { // 连接成功时的回调函数
  console.log(userName + '的Websocket连接成功')
  var tx = stomp.begin() // 事务支持
  let strJson = JSON.stringify({
    'pageName': pageName,
    'srcId': srcId,
    'pointList': pointList,
    'timeList': timeList
  })

  stomp.send('/app/setpoint', { transaction: tx.id }, strJson)
  tx.commit()
  stomp.subscribe(subscribeUrl, function (response) {
    self.dataMap = JSON.parse(response.body)
    // 回调处理函数
    // console.log(dataMap)
  })

  timer = setInterval(() => {
    var mes = JSON.stringify({
      'mes': this.userName + '心跳保持'
    })
    stomp.send('/app/keepalive', {}, mes)
  }, 2000)
}

function errorCallback () { // 连接失败时的回调函数，此函数重新调用连接方法，形成循环，直到连接成功
  console.log(userName + '的Websocket连接失败，正在尝试重新连接...')
  disconnect()
  setTimeout(() => {
    connected()
  }, 5000)
}

function disconnect () {
  if (stomp !== null) {
    stomp.disconnect()
  }
  clearInterval(timer)
  console.log(userName + '  Disconnected')
}

function check () {
  var self=this
  stomp.onclose = function (e) {
    console.log(e)
    clearInterval(self.timer)
    self.connected()
  }

  stomp.onerror = function (e) {
    clearInterval(self.timer)
    self.connected()
    self.connected()
  }

  ws.onclose = function (e) {
    console.log('websocket断开: ' + e.code + ' ' + e.reason + ' ' + e.wasClean)
    console.log(e)
    clearInterval(self.timer)
    self.disconnect()
    self.stomp = null
    setTimeout(() => {
      self.connected()
    }, 5000)
  }

  ws.onerror = function () {
    self.connected()
    console.log('websocket连接错误!')
    clearInterval(self.timer)
    self.disconnect()
    self.stomp = null
    setTimeout(() => {
      self.connected()
    }, 5000)
  }
}
