import {GetDivUsers, GetSkills, GetUser, GetXp} from './queries.js'


// let skills = new GetSkills("3mil")
// console.log(await skills.skillsArr())
//
//
// let user = new GetUser("3mil")
// console.log(await user.getUserInfo())
//
let xp = new GetXp("AaEnnDeeErrEeEss")
console.log(await xp.getXp())


// let maxXp = 0
// let minXp = 100
//
// let allUsers = new GetDivUsers()
// let data = await allUsers.getUsers()
// for (const el of data) {
//     let xp = await new GetXp(el.login).getXp()
//     if (minXp > await xp.div_01.xp) {
//         minXp = xp.div_01.xp
//     }
//     if (maxXp < await xp.div_01.xp) {
//         maxXp = xp.div_01.xp
//     }
//     // console.log({login: el.login, data: await xp})
// }
//
// console.log(maxXp)
// console.log(minXp)