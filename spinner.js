import {getNode} from "./charts.js";

export class Spinner {
    svg
    body = document.getElementById('main')

    constructor() {
        this.init()
    }

    hide() {
        this.svg.classList.add('hide')
    }

    show() {
        this.svg.classList.add('show')
    }

    init() {
        this.svg = getNode('svg', {width: '65px', height: '65px', viewBox: '0 0 66 66', id: "spinner"})
        let circle = getNode('circle', {
            fill: "none",
            "stroke-width": 6,
            "stroke-linecap": "round",
            cx: 33,
            cy: 33,
            r: 30,
            viewBox: '0 0 66 66',
            class: 'path'
        })
        this.svg.append(circle)
        this.body.append(this.svg)
    }
}
