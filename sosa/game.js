
const requestFullscreen = (element) => {
    if (!(document.fullscreenEnabled || document.mozFullScreenEnabled || document.documentElement.webkitRequestFullScreen)) {
        alert('전체화면을 지원하지 않습니다 ㅜㅜ')
        return
    }
	if (element.requestFullscreen) {
		element.requestFullscreen()
	} else if (element.mozRequestFullScreen) {
		element.mozRequestFullScreen()
	} else if (element.webkitRequestFullScreen) {
		element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
	}
}

const ctx = {
    data: null,
    scene: 'splash',
    day: 1,
    money: 10000
}
const $day = document.getElementById('day')
const $money = document.getElementById('money')
const $image = document.getElementById('image')
const $message = document.getElementById('message')

const $button1 = document.getElementById('button-1')
const $button2 = document.getElementById('button-2')
const $button3 = document.getElementById('button-3')
const $button4 = document.getElementById('button-4')
const $buttons =  [$button1, $button2, $button3, $button4]

const chooseButton = ($event) => {
    const $currentButtons = getCurrentButtonElements()
    for (let index = 0; index < $currentButtons.length; index++) {
        if ($event.target === $currentButtons[index]) {
            act(getCurrentSceneData().button[index].action)
            return
        }
    }
}

for (let $button of $buttons) {
    $button.addEventListener('click', chooseButton)
}

const mapButtons = (buttons, $currentButtons) => {
    for (let $button of $buttons) {
        $button.setAttribute('style', 'visibility: hidden')
    }
    for (let index = 0; index < buttons.length; index++) {
        const button = buttons[index]
        const $button = $currentButtons[index]
        $button.innerHTML = button.name
        $button.setAttribute('style', 'visibility: visible')
    }
}

const changeCurrentSceneData = (name) => {
    ctx.scene = name
    return getCurrentSceneData()
}
const getCurrentSceneData = () => ctx.data.scene[ctx.scene]
const getCurrentButtonElements = () => {
    const countOfChoices = getCurrentSceneData().button.length
    switch (countOfChoices) {
        case 1:
            return [$button4]
        case 2:
            return [$button3, $button4]
        case 3:
            return [$button1, $button2, $button3]
        case 4:
            return [$button1, $button2, $button3, $button4]
    }
}

const changeScene = (name) => {
    const scene = changeCurrentSceneData(name)
    if (scene.image) {
        image.setAttribute('style', `background-image: url("${scene.image}")`)
    }
    $message.innerHTML = scene.message
    if (scene.action) {
        act(scene.action)
    }
    if (scene.button) {
        mapButtons(scene.button, getCurrentButtonElements())
    } else {
        alert('no button defined')
    }
}

const scriptFunctions = {
    makeFullScreen: () => requestFullscreen(document.documentElement),
    initializeStatus: () => {
        alert('init!')
    }
}

const act = (actions) => {
    for (let action of actions) {
        console.log(action)
        switch (action.type) {
            case 'javascript':
                scriptFunctions[action.function]()
                break

            case 'changeScene':
                changeScene(action.scene)
                break
        }
    }
}

fetch('/sosa/data.json').then(e => e.json()).then(data => {
    ctx.data = data
    changeScene('splash')
})
