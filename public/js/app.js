const socket = io()
let myself

const chatMembers = document.querySelector('#chat-members')
const chatMessage = document.querySelector('#chat-message')
const chatMessages = document.querySelector('#chat-messages')
const chatMessageInput = chatMessage.querySelector('textarea')

function sendMessage(event) {
    event.preventDefault()
    if (!chatMessageInput.value) return
    const message = chatMessageInput.value
    socket.emit('message', message)
    chatMessageInput.value = ''
}

function appendMessage({ username, message }) {
    const newMessage = document.createElement('div')
    newMessage.style = `inline-size: 700px; overflow-wrap: break-word;`
    newMessage.innerHTML = `<b>[${username}]:</b> ${message}`
    chatMessages.appendChild(newMessage)
}

function appendMember({ username }, myself=false) {
    const newMember = document.createElement('div')
    newMember.dataset.member = username
    newMember.innerHTML = `${username}`
    if (myself) newMember.innerHTML += ` (you)`
    newMember.innerHTML += '<hr/>'
    chatMembers.appendChild(newMember)
}

function removeMember({ username }) {
    const selector = `div[data-member="${username}"]`
    const element = document.querySelector(selector)
    element.remove()
}

function renderMembers(members) {
    for (const member of members) {
        appendMember(member)
    }
}

function renderMember({ username }) {
    if (username === myself) return
    appendMember({ username })
}

function renderMyself({ username }) {
    appendMember({ username }, myself=true)
    myself = username
}

chatMessage.addEventListener('submit', sendMessage)
socket.on('members', renderMembers)
socket.on('message', appendMessage)
socket.on('myself', renderMyself)
socket.on('join', renderMember)
socket.on('left', removeMember)