import {spinner} from "./index.js";

class fetchGraphQl {
    url = "https://01.kood.tech/api/graphql-engine/v1/graphql"

    constructor(query, variables) {
        this._query = query;
        this._variables = variables;
    }

    async Query(limit, offset) {
        const res = await fetch(this.url, {
            method: "POST", headers: {
                "Content-Type": "application/json", "Accept": "application/json",
            }, body: JSON.stringify({
                query: this._query, variables: {
                    ...this._variables, limit: limit, offset: offset,
                },
            })
        })
        const json = await res.json();
        return json.data;
    }
}

export class GetUser {
    login
    id

    constructor(login) {
        this._login = login
    }

    async getUserInfo() {
        await this.init()
        return {login: this.login, id: this.id}
    }

    async load(offset = 0, limit = 50) {
        return await new fetchGraphQl(this.query, {userLogin: this._login}).Query(limit, offset)
    }

    async init() {
        await this.load().then(data => {
            this.id = data.user[0].id
            this.login = data.user[0].login
        })
    }

    query = `
        query getUser($userLogin: String, $limit: Int, $offset: Int) {
      user(where: {login: {_eq: $userLogin}}, limit: $limit, offset: $offset) {
        id
        login
      }
    }
    `
}

export class GetSkills {
    _skillsArr = []
    _recursCall = 0

    async skillsArr() {
        await this.init()
        return this.filter(this._skillsArr)
    }

    constructor(login) {
        this._login = login
    }

    async init() {
        await this.load(this._recursCall * 50).then(data => {
            this._skillsArr.push(...data.transaction)
            if (data.transaction.length !== 50) {
                return
            }
            this._recursCall++
            this.init()
        })
    }

    query = `
    query getSkills($userLogin: String, $limit: Int, $offset: Int) {
      transaction(
        where: {user: {login: {_eq: $userLogin}}, type: {_nin: ["xp", "up", "down"]}}
        order_by: {createdAt: desc}
        limit: $limit
        offset: $offset
      ) {
        amount
        type
      }
    }
    `

    async load(offset = 0, limit = 50) {
        return await new fetchGraphQl(this.query, {userLogin: this._login}).Query(limit, offset)
    }

    filter(arr) {
        let skillsNames = []
        return arr.filter(el => {
            if (!skillsNames.includes(el.type)) {
                skillsNames.push(el.type)
                return el
            }
        })
    }
}

export class GetXp {
    _arr = []
    _recursCall = 0

    constructor(login) {
        this._login = login
    }

    count(arr) {
        let divXp = 0
        let jsPiscineXp = 0
        let goPiscineXp = 0
        let doneXp = 0
        let receivedXp = 0
        let received = 0
        let done = 0


        let moduleDown = {}
        arr.filter(el => {
            if (el.type === 'down') {
                received++
                receivedXp += el.amount
                moduleDown[el.path] = el.amount
            }

            if (el.type === "up") {
                doneXp += el.amount
                done++
            }

        })

        let div_01 = {}
        let piscine_js = {}
        let piscine_go = {}
        arr.forEach(el => {
            if (el.type === 'xp') {
                if (moduleDown[el.path]) {
                    if (div_01[el.path] && div_01[el.path].byte < el.amount) {
                        div_01[el.path] = {byte: el.amount, date: el.createdAt, task: el.object.name}
                    }
                    if (!div_01[el.path]) {
                        div_01[el.path] = {byte: el.amount, date: el.createdAt, task: el.object.name}
                    }
                }

                if (el.path.includes("piscine-js/") || el.path.includes("piscine-js-2/")) {
                    if (el.path.includes("piscine-js-2/")) {
                        piscine_js[el.path.replace('piscine-js-2/', 'piscine-js/')] = {
                            byte: el.amount,
                            date: el.createdAt,
                            task: el.object.name
                        }
                    } else {
                        piscine_js[el.path] = {byte: el.amount, date: el.createdAt, task: el.object.name}
                    }
                }
                if (el.path.includes("piscine-go")) {
                    piscine_go[el.path] = {byte: el.amount, date: el.createdAt, task: el.object.name}
                }
            }
        })

        let sizeDiv_01 = Object.values(div_01);
        sizeDiv_01.forEach(el => {
            divXp += el.byte / 1000
        })

        let sizePiscine_js = Object.values(piscine_js);
        sizePiscine_js.forEach(el => {
            jsPiscineXp += el.byte / 1000
        })

        let sizePiscine_go = Object.values(piscine_go);
        sizePiscine_go.forEach(el => {
            goPiscineXp += el.byte / 1000
        })

        let DivProjectExists = Object.keys(div_01).length > 0;
        let JsProjectExists = Object.keys(piscine_js).length > 0;

        return {
            AuditsReceived: {xp: Math.round(receivedXp / 1000), received},
            AuditsDone: {xp: Math.round(doneXp / 1000), done},
            // 70kb for JsPiscine
            ...(DivProjectExists) ? {
                div_01: {
                    xp: Math.round(divXp > 70 && divXp + 70),
                    projects: div_01
                }
            } : {div_01: {xp: 0, projects: null}},
            ...(JsProjectExists) ? {
                js_piscine: {
                    xp: Math.round(jsPiscineXp),
                    projects: piscine_js
                }
            } : {js_piscine: {xp: 0, projects: null}},
            go_piscine: {xp: Math.round(goPiscineXp), projects: piscine_go}
        }
    }

    async getXp() {
        return this.count(await this.init())
    }

    async init() {
        return new Promise(async (resolve, reject) => {
            let all = async () => {
                await this.load(this._recursCall * 50).then(data => {
                    this._arr.push(...data.transaction)
                    if (data.transaction.length !== 50) {
                        resolve(this._arr)
                        return this._arr
                    }
                    this._recursCall++
                    all()
                })
            }
            await all()

        })
    }

    async load(offset = 0, limit = 50) {
        return await new fetchGraphQl(this.query, {userLogin: this._login}).Query(limit, offset)
    }

    query = `
   query getXp($userLogin: String, $limit: Int, $offset: Int) {
  transaction(
    where: {user: {login: {_eq: $userLogin}}, type: {_in: ["xp", "up", "down"]}}
    order_by: {createdAt: desc}
    limit: $limit
    offset: $offset
  ) {
    amount
    path
    createdAt
    type
    object {
      name
    }
  }
}
    `
}

export class GetDivUsers {
    _arr = []
    _recursCall = 0

    async getUsers() {
        return await this.init()
    }

    async getUsersWithXp() {
        let data = []

        let allUsers = await this.getUsers()

        spinner.show()
        for (const el of allUsers) {
            let xp = await new GetXp(el.login).getXp()
            data.push({login: el.login, data: xp})
        }
        spinner.hide()

        return {usersLen: allUsers.length, data}
    }

    async init() {
        return new Promise(async (resolve, reject) => {
            let all = async () => {
                await this.load(this._recursCall * 20).then(data => {
                    this._arr.push(...data.user)
                    if (data.user.length !== 20) {
                        resolve(this._arr)
                        return this._arr
                    }
                    this._recursCall++
                    all()
                })
            }
            await all()

        })
    }

    async load(offset = 0, limit = 20) {
        return await new fetchGraphQl(this.query, {}).Query(limit, offset)
    }

    query = `
query getUsers($limit: Int, $offset: Int) {
  user(
    order_by: {login: asc}
    where: {progresses: {path: {_iregex: "div-01"}}}
    limit: $limit
    offset: $offset
  ) {
    login
  }
}
    `
}




