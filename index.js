import {GetDivUsers, GetSkills, GetUser, GetXp} from './queries.js'
import {ChartCircle, ChartStudentsRating} from "./charts.js";
import {Spinner} from "./spinner.js";

const substrings = ['skill_front-end', 'skill_back-end', 'skill_game', 'skill_sys-admin', 'skill_algo', 'skill_stats']
let techSkills
let technologies
let skills

let input = document.getElementsByTagName('input')

let timerId
let debounceFunction = function (func, delay) {
    clearTimeout(timerId)
    timerId = setTimeout(func, delay)
}
input[0].addEventListener('input', function () {
    debounceFunction(() => userData(input[0].value), 500)
})


let techSkillsChart = new ChartCircle()
let technologiesChart = new ChartCircle()

const userData = async (inputValue = '3mil') => {
    let user = await new GetUser(inputValue).getUserInfo()
    document.getElementById('userLogin').textContent = 'User login: ' + user.login
    document.getElementById('userId').textContent = 'User id: ' + user.id
    skills = await new GetSkills(inputValue).skillsArr()
    let xp = await new GetXp(inputValue).getXp()
    let cards = document.getElementsByTagName('h2')
    for (let i = 0; i < cards.length; i++) {
        cards.item(i).textContent = `${Object.entries(xp)[i][0]}: 
        ${Object.entries(xp)[i][1].xp}xp `
        cards.item(i).textContent += `${Object.entries(xp)[i][1].done ? 'amount:' + Object.entries(xp)[i][1].done : ""}`
        cards.item(i).textContent += `${Object.entries(xp)[i][1].received ? 'amount:' + Object.entries(xp)[i][1].received : ""}`
    }


    techSkills = skills.filter(s => substrings.some(e => s.type.includes(e)))
    technologies = skills.filter(s => !substrings.some(e => s.type.includes(e)))
    techSkillsChart.calculate(techSkills)
    technologiesChart.calculate(technologies)
}

userData()

export let spinner = new Spinner()
let usersWithXp = await new GetDivUsers().getUsersWithXp()
new ChartStudentsRating(usersWithXp, "div_01")
new ChartStudentsRating(usersWithXp, "go_piscine")
new ChartStudentsRating(usersWithXp, "js_piscine")
new ChartStudentsRating(usersWithXp, "AuditsDone")
new ChartStudentsRating(usersWithXp, "AuditsReceived")




