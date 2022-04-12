export function getNode(n, v) {
    n = document.createElementNS("http://www.w3.org/2000/svg", n);
    for (let p in v)
        n.setAttributeNS(null, p, v[p]);
    return n
}

export class ChartCircle {
    body = document.getElementById('circleContainer')

    svg
    polygon
    group
    polygonPoints
    polMinMax = [
        {max: [200, 0], min: [200, 200]},
        {max: [373, 100], min: [200, 200]},
        {max: [373, 300], min: [200, 200]},
        {max: [200, 400], min: [200, 200]},
        {max: [26.79, 300], min: [200, 200]},
        {max: [26.79, 100], min: [200, 200]},]

    constructor() {
        this.createCircle()
        this.createLines(this.polMinMax)
    }

    calculate(data) {
        this.polygonPoints = []
        this.pushPointsToPolygon(data, this.polygonPoints, this.polMinMax)
        this.createPolygon()
        this.createCircles(this.polygonPoints)
    }

    createCircle() {
        this.svg = getNode("svg", {
            x: "0px",
            y: "0px",
            width: "100%",
            height: "100%",
            viewBox: "0 0 400 400",
            style: "overflow: visible;"
        })
        this.group = getNode("g")
        let circle = getNode("circle", {
            fill: "none",
            stroke: `rgb(170, 170, 170)`,
            "stroke-width": "0.75",
            cx: "200",
            cy: "200",
            r: "200",
        })
        this.group.append(circle)
        this.svg.append(this.group)
        this.svg.classList.add('circleChart')
        this.body.append(this.svg)

    }

    pushPointsToPolygon(queryAns, polygon, polyMinMax) {
        for (let i = 0; i < polyMinMax.length; i++) {
            polygon.push(
                {
                    x: this.ratio(polyMinMax[i].max[0], polyMinMax[i].min[0], queryAns[i] && queryAns[i].amount),
                    y: this.ratio(polyMinMax[i].max[1], polyMinMax[i].min[1], queryAns[i] && queryAns[i].amount),
                    p: queryAns[i] && queryAns[i].amount,
                    skill: queryAns[i] && queryAns[i].type
                })
        }
    }

    createPolygon() {
        if (this.group.lastChild.toString() === '[object SVGPolygonElement]') {
            this.group.removeChild(this.group.lastChild)
        }

        this.polygon = getNode("polygon", {
            style: "fill:rgba(125,190,255,0.39);",
            points: this.build(this.polygonPoints)
        })
        this.group.append(this.polygon)
    }

    ratio(max, min, p) {
        if (min > max && (min !== 0 && max !== 0)) {
            return min - ((min - max) / 100 * p)
        }
        if (min < max && (min !== 0 && max !== 0)) {
            return (max - min) / 100 * p + min
        }
        if (min > max) {
            return min - (min / 100 * p)
        }
        if (min < max) {
            return (max - min) / 100 * p + min
        }
        if (min === max) {
            return min
        }
    }

    build(arg) {
        let res = [];
        for (let i = 0; i < arg.length; i++) {
            if (!isNaN(arg[i].x) && !isNaN(arg[i].y)) {
                res.push(`${arg[i].x},${arg[i].y}`)
            } else {
                res.push('200, 200')
            }
        }
        return res.join(' ');
    }

    createCircles(polygon) {
        let circleGroup = this.svg.querySelectorAll('.circleGroup')
        circleGroup.forEach(el => {
            el.remove()
        })

        polygon.forEach(point => {
            if (!isNaN(point.x) && !isNaN(point.y)) {
                let group = getNode("g")
                group.classList.add('circleGroup')
                let text = getNode("text", {x: point.x, y: point.y})
                let circle = getNode("circle", {
                    cx: point.x,
                    cy: point.y,
                    r: "2",
                    style: "fill: #9FB7FF; stroke: #9FB7FF; stroke-width: 1px;"
                })

                let skill = point.skill.replace("skill_", "")
                skill = skill.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
                text.textContent = `${skill} ${point.p}%`
                text.style.fontSize = '10px'

                group.append(circle)
                group.append(text)
                this.svg.append(group)
            }
        })
    }

    createLines(polMinMax) {
        polMinMax.forEach(el => {
            let group = getNode("g")
            let line = getNode("line",
                {
                    "stroke-width": "0.75",
                    stroke: "rgb(170, 170, 170)",
                    x1: el.max[0],
                    x2: el.min[0],
                    y1: el.max[1],
                    y2: el.min[1]
                })
            group.append(line)

            for (let i = 0; i < 10; i++) {
                let circle = getNode("circle",
                    {
                        cx: this.ratio(el.max[0], el.min[0], i * 10),
                        cy: this.ratio(el.max[1], el.min[1], i * 10),
                        fill: "rgb(170, 170, 170)",
                        r: `${i > 0 ? "1" : "0"}`
                    }
                )
                group.append(circle)
            }
            this.svg.append(group)
        })

    }
}

export class ChartStudentsRating {
    body = document.getElementById('studentsRatingContainer')
    svg

    constructor(data, module) {
        this._data = data
        this.div_01 = this.sorting(this._data, "div_01")
        this.go_piscine = this.sorting(this._data, "go_piscine")
        this.js_piscine = this.sorting(this._data, "js_piscine")
        this.AuditsDone = this.sorting(this._data, "AuditsDone")
        this.AuditsReceived = this.sorting(this._data, "AuditsReceived")

        this.createChart(module)
    }


    createChart(module) {
        let svgH = 0

        this.svg = getNode("svg", {
            x: "0px",
            y: "0px",
            width: "100%",
        })

        for (let i = 0, j = 0; i < this[module].length; i++) {
            if (this[module][i].data[module].xp !== 0) {
                let lastProject = ''
                svgH += 20
                let g = getNode('g', {class: 'bar'})


                let rect = getNode("rect", {
                    y: i * 20 + 2,
                    width: this[module][i].data[module].xp / 100 * 20,
                    height: 20,
                    fill: "hsl(0, 0%, 50%)",
                })


                let date = new Date("2021-01-12T00:00:00.000000+00:00")
                for (const property in this[module][i].data[module].projects) {
                    if (new Date(this[module][i].data[module].projects[property].date) > date) {
                        date = new Date(this[module][i].data[module].projects[property].date)
                        lastProject = this[module][i].data[module].projects[property].task
                    }
                }
                let text = getNode("text", {y: j * 20 + 16})
                g.append(rect, text)

                if (module === 'AuditsDone' || module === 'AuditsReceived') {
                    text.textContent = `${j + 1} ${this[module][i].login}, ${this[module][i].data[module].xp}xp`
                } else {
                    text.textContent = `${j + 1} ${this[module][i].login}, ${this[module][i].data[module].xp}xp, last project: ${lastProject}`
                }

                this.svg.append(g)
                j++
            }
        }

        this.svg.style.height = `${svgH}px`
        let div = document.createElement("div")
        let div2 = document.createElement("div")
        div.classList.add("rating")
        div.append(this.svg)
        let h6 = document.createElement("h6")
        h6.textContent = module
        h6.style.textAlign = 'center'
        div2.append(h6)
        div2.append(div)
        this.body.append(div2)

    }

    sorting(data, sortBy) {
        let sorted = [...data.data].sort((a, b) => a.data[`${sortBy}`].xp - b.data[`${sortBy}`].xp)
        return sorted.reverse()
    }
}