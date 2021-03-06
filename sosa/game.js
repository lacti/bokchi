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
  week: 0,
  category: 0,
  money: 0,
  loop: 0,
  stat: {},
  flag: [],
  running: false
}
const $body = document.body
const $week = document.getElementById('week')
const $money = document.getElementById('money')
const $image = document.getElementById('image')
const $caption = document.getElementById('caption')
const $message = document.getElementById('message')

const clickEventName =
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    ? 'touchstart'
    : 'click'

$body.addEventListener(clickEventName, $event => {
  const scene = getCurrentSceneData()
  if (scene.button) {
    return
  }
  if (ctx.money <= 0 && ctx.running) {
    changeScene('rest_in_peace')
    ctx.running = false
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
        if (isTrue(condition)) {
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
  return true
}
const addDay = inc => setDay(ctx.week + inc)
const setMoney = value => {
  ctx.money = value
  $money.innerText = formatMoney(ctx.money)
  return true
}
const addMoney = delta => setMoney(ctx.money + delta)
const isTrue = condition => condition && eval(condition) // eslint-disable-line

for (let $button of $buttons) {
  $button.addEventListener(clickEventName, $event => {
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
  $caption.innerHTML = ''
  $image.setAttribute(
    'style',
    `background-image: url("image/${scene.image || `${name}.png`}")`
  )
  const message =
    scene.message.constructor.name === 'String'
      ? scene.message
      : scene.message.length > 0
        ? scene.message[rand(scene.message.length)]
        : ''
  $message.innerHTML = nl2br(
    scene.message.indexOf('${') < 0 ? message : eval(message) // eslint-disable-line
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
  return true
}

const scriptFunctions = {
  makeFullScreen: () => requestFullscreen(document.documentElement),
  initializeStatus: () => {
    setDay(1)
    setMoney(10000)
    ctx.stat = { earn: 0, lose: 0, flow: [] }
    ctx.running = true
    ctx.loop++
  },
  rank: () => {
    let comment = ''
    do {
      comment = (window.prompt('유언을 남겨주세요 (8글자)') || '').trim()
      if (!comment) return
    } while (comment.length > 8)
    const data = {
      comment: comment,
      week: ctx.week,
      category: ctx.category,
      earn: ctx.stat.flow.filter(e => e > 0).reduce((a, b) => a + b, 0),
      lose: ctx.stat.flow
        .slice(1)
        .filter(e => e < 0)
        .reduce((a, b) => a + b, 0),
      loop: ctx.loop,
      flow: ctx.stat.flow.join(',')
    }
    console.log(data)
    window
      .fetch('rank', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
      })
      .then(r => r.json())
      .then(r => {
        console.log(r)
        ctx.rank = r
        changeScene('rank')
      })
      .catch(err => {
        console.log(err)
        window.alert('기록에 실패했습니다 ㅜㅜ')
        changeScene('intro-1')
      })
  },
  showRank: () => {
    const _print = rank => {
      const messages = []
      let index = 1
      for (let e of rank) {
        messages.push(
          `${index++}등 ${e.category === 0 ? '치킨' : '빵'} ${
            e.week
          }주 ${formatMoney(e.earn)}: ${e.comment}`
        )
      }
      $image.setAttribute(
        'style',
        $image.getAttribute('style') + ';opacity:0.5'
      )
      $caption.innerHTML = `${messages.join('<br>')}`
    }
    if (ctx.rank) _print(ctx.rank)
    else {
      window
        .fetch('rank')
        .then(r => r.json())
        .then(r => {
          ctx.rank = r
          _print(ctx.rank)
        })
        .catch(err => {
          console.log(err)
          window.alert('기록을 불러올 수 없습니다 ㅜㅜ')
          changeScene('intro-1')
        })
    }
  }
}
const showMoneyChanged = amount => {
  if (amount > 0) {
    $message.innerHTML += ` <font color="blue">${formatMoney(
      amount
    )} 벌었다!</font>`
  } else if (amount < 0) {
    $message.innerHTML += ` <font color="red">${formatMoney(
      -amount
    )} 지출 ㅜㅜ</font>`
  }
}

const rand = max => Math.floor(Math.random() * max)
const act = (maybeActions, hint) => {
  if (maybeActions === undefined || maybeActions === null) {
    return false
  }
  const actions =
    maybeActions.constructor.name === 'Object'
      ? [maybeActions]
      : maybeActions.constructor.name !== 'Array'
        ? [{ [hint || 'scene']: maybeActions }]
        : maybeActions
  const _act = (type, value, hint) => {
    console.log(`[act] ${type}: ${value}`)
    switch (type) {
      case 'javascript':
        return scriptFunctions[value]()
      case 'scene':
        return changeScene(value, hint)
      case 'week':
        return addDay(value)
      case 'category':
        ctx.category = value
        return true
      case 'money':
        if (value > 0) ctx.stat.earn += value
        ctx.stat.flow.push(value)
        showMoneyChanged(value)
        return addMoney(value)
      case 'result':
        return act(ctx.data.result[value])
    }
  }
  const _actMany = action => {
    let acted = false
    let moneyChanged = 0
    for (let [type, value] of Object.entries(action)) {
      acted = _act(type, value, moneyChanged) || acted
      moneyChanged = type === 'money' ? value : 0
    }
    return acted
  }
  // Unconditionally
  for (let action of actions.filter(a => !a.prob && !a.cond)) _actMany(action)

  // Conditionally
  let acted = false
  for (let action of actions.filter(a => a.cond))
    if (isTrue(action.cond)) acted = _actMany(action) || acted

  // Probability
  const randomActions = actions.filter(a => a.prob)
  while (acted === false && randomActions.length > 0) {
    for (let action of randomActions)
      if (action.prob > rand(100)) return (acted = _actMany(action) || acted)
  }
  return acted
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
  return money >= 0
    ? _format(money * 10000, 0)
    : '-' + _format(-money * 10000, 0)
}
