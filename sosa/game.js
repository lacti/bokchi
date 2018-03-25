const requestFullscreen = element => {
  if (
    !(
      document.fullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.documentElement.webkitRequestFullScreen
    )
  ) {
    window.alert('전체화면을 지원하지 않습니다 ㅜㅜ')
    return
  }
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen()
  } else if (element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT) // eslint-disable-line
  }
}

const ctx = {
  data: null,
  scene: 'splash',
  week: 1,
  money: 10000
}
const $body = document.body
const $week = document.getElementById('week')
const $money = document.getElementById('money')
const $image = document.getElementById('image')
const $message = document.getElementById('message')

$body.addEventListener('click', $event => {
  const scene = getCurrentSceneData()
  if (scene.button) {
    return
  }
  if (ctx.money <= 0) {
    changeScene('rest_in_peace')
    return
  }
  if (scene.next) {
    if (scene.next.constructor.name === 'String') {
      changeScene(scene.next)
    } else if (scene.next.constructor.name === 'Array') {
      for (let each of scene.next) {
        console.log('next: ' + JSON.stringify(each))
        const nextScene = Object.keys(each)[0]
        const condition = each[nextScene]
        if (eval(condition) /* eslint-disable-line */) {
          changeScene(nextScene)
          break
        }
      }
    } else {
      console.log('invalid')
    }
  } else {
    window.alert('No next scene.')
  }
})

const $button1 = document.getElementById('button-1')
const $button2 = document.getElementById('button-2')
const $buttons = [$button1, $button2]

const setDay = value => {
  ctx.week = value
  $week.innerText = `${ctx.week}주차`
}
const addDay = inc => setDay(ctx.week + inc)
const setMoney = value => {
  ctx.money = value
  $money.innerText = formatMoney(ctx.money * 10000)
}
const addMoney = delta => setMoney(ctx.money + delta)

for (let $button of $buttons) {
  $button.addEventListener('click', $event => {
    const $currentButtons = getCurrentButtonElements()
    for (let index = 0; index < $currentButtons.length; index++) {
      if ($event.target === $currentButtons[index]) {
        act(getCurrentSceneData().button[$event.target.innerHTML], 'scene')
        $event.stopPropagation()
        return
      }
    }
  })
}

const hideAllButtons = () => {
  for (let $button of $buttons) {
    $button.setAttribute('style', 'display: none')
  }
}
const mapButtons = (buttons, $currentButtons) => {
  let index = 0
  for (let name of Object.keys(buttons)) {
    const $button = $currentButtons[index++]
    $button.innerHTML = name
    $button.setAttribute('style', '')
  }
}

const changeCurrentSceneData = name => {
  ctx.scene = name
  return getCurrentSceneData()
}
const getCurrentSceneData = () => ctx.data.scene[ctx.scene]
const getCurrentButtonElements = () => {
  const countOfChoices = Object.keys(getCurrentSceneData().button).length
  switch (countOfChoices) {
    case 1:
      return [$button2]
    case 2:
      return [$button1, $button2]
  }
}
const isFeeDay = () => (ctx.week - 1) % 4 === 0 // eslint-disable-line
const nl2br = str => (str || '').replace(/\n/, '<br>')
const changeScene = (name, moneyChanged) => {
  console.log(name)
  const scene = changeCurrentSceneData(name)
  $image.setAttribute(
    'style',
    `background-image: url("${scene.image || `${name}.png`}")`
  )
  $message.innerHTML = nl2br(
    scene.message.indexOf('${') < 0 ? scene.message : eval(scene.message) // eslint-disable-line
  )
  if (moneyChanged) {
    showMoneyChanged(moneyChanged)
  }
  if (scene.action) {
    act(scene.action, 'javascript')
  }
  hideAllButtons()
  if (scene.button) {
    mapButtons(scene.button, getCurrentButtonElements())
  }
}

const scriptFunctions = {
  makeFullScreen: () => requestFullscreen(document.documentElement),
  initializeStatus: () => {
    setDay(1)
    setMoney(10000)
  }
}
const showMoneyChanged = amount => {
  if (amount > 0) {
    $message.innerHTML += ` <font color="blue">${formatMoney(
      Math.abs(amount) * 10000
    )} 벌었다!</font>`
  } else if (amount < 0) {
    $message.innerHTML += ` <font color="red">${formatMoney(
      Math.abs(amount) * 10000
    )} 지출 ㅜㅜ</font>`
  }
}

const act = (actions, hint) => {
  if (actions === undefined || actions === null) {
    return
  }
  if (actions.constructor.name === 'Object') {
    return act([actions])
  }
  if (actions.constructor.name !== 'Array') {
    return act({ [hint || 'scene']: actions })
  }
  for (let action of actions) {
    console.log(action)
    for (let [type, value] of Object.entries(action)) {
      switch (type) {
        case 'javascript':
          scriptFunctions[value]()
          break

        case 'scene':
          changeScene(value)
          break

        case 'week':
          addDay(value)
          break

        case 'money':
          addMoney(value)
          showMoneyChanged(value)
          break

        case 'result':
          processResult(value)
          break
      }
    }
  }
}

window
  .fetch('data.json')
  .then(e => e.json())
  .then(data => {
    ctx.data = data
    changeScene('splash')
  })

const formatMoney = money => {
  const _format = (money, depth) => {
    if (money <= 0) {
      return depth === 0 ? '0원' : ''
    }
    const upper = Math.floor(money / 10000)
    const lower = money % 10000
    return (
      _format(upper, depth + 1) +
      (lower === 0 ? (depth === 0 ? '원' : '') : lower + '원만억조'[depth])
    )
  }
  return money >= 0 ? _format(money, 0) : '-' + _format(-money, 0)
}

const processResult = resultName => {
  const result = ctx.data.result[resultName]
  act(result.action)

  let gauge = Math.floor(Math.random() * 100)
  for (let [nextScene, candidate] of Object.entries(result)) {
    if (!candidate.prob) continue

    gauge -= candidate.prob
    if (gauge <= 0) {
      act(candidate.money, 'money')
      changeScene(nextScene, candidate.money)
      return
    }
  }
}
