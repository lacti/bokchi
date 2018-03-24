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
  day: 1,
  money: 10000
}
const $body = document.body
const $day = document.getElementById('day')
const $money = document.getElementById('money')
const $image = document.getElementById('image')
const $message = document.getElementById('message')

$body.addEventListener('click', $event => {
  const scene = getCurrentSceneData()
  if (scene.button) {
    return
  }
  if (scene.next) {
    changeScene(scene.next)
  } else if (scene.next_if) {
    for (let each of scene.next_if) {
      if (eval(each.condition)) {
        changeScene(each.name)
        break
      }
    }
  } else {
    window.alert('No next scene.')
  }
})

const $button1 = document.getElementById('button-1')
const $button2 = document.getElementById('button-2')
const $buttons = [$button1, $button2]

const setDay = value => {
  ctx.day = value
  $day.innerText = `${ctx.day}일차`
}
const addDay = inc => setDay(ctx.day + inc)
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
        act(getCurrentSceneData().button[index].action)
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
  for (let index = 0; index < buttons.length; index++) {
    const button = buttons[index]
    const $button = $currentButtons[index]
    $button.innerHTML = button.name
    $button.setAttribute('style', '')
  }
}

const changeCurrentSceneData = name => {
  ctx.scene = name
  return getCurrentSceneData()
}
const getCurrentSceneData = () => ctx.data.scene[ctx.scene]
const getCurrentButtonElements = () => {
  const countOfChoices = getCurrentSceneData().button.length
  switch (countOfChoices) {
    case 1:
      return [$button2]
    case 2:
      return [$button1, $button2]
  }
}

const changeScene = name => {
  console.log(name)
  const scene = changeCurrentSceneData(name)
  if (scene.image) {
    $image.setAttribute('style', `background-image: url("${scene.image}")`)
  }
  $message.innerHTML = scene.message
  if (scene.action) {
    act(scene.action)
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

const act = actions => {
  for (let action of actions) {
    console.log(action)
    switch (action.type) {
      case 'javascript':
        scriptFunctions[action.function]()
        break

      case 'changeScene':
        changeScene(action.scene)
        break

      case 'addDay':
        addDay(action.amount)
        break

      case 'addMoney':
        addMoney(action.amount)
        break

      case 'result':
        processResult(action.name)
        break
    }
  }
  if (ctx.money <= 0) {
    changeScene('rest_in_peace')
  }
}

window
  .fetch('/sosa/data.json')
  .then(e => e.json())
  .then(data => {
    ctx.data = data
    changeScene('splash')
  })

const formatMoney = (money, depth = 0) => {
  if (money <= 0) {
    return depth === 0 ? '0원' : ''
  }
  const upper = Math.floor(money / 10000)
  const lower = money % 10000
  return (
    formatMoney(upper, depth + 1) +
    (lower === 0 ? (depth === 0 ? '원' : '') : lower + '원만억조'[depth])
  )
}

const processResult = resultName => {
  const candidates = ctx.data.result[resultName]
  let gauge = Math.floor(Math.random() * 100)
  for (let candidate of candidates) {
    gauge -= candidate.weight
    if (gauge <= 0) {
      act(candidate.action)
      changeScene(candidate.scene)
      return
    }
  }
}
