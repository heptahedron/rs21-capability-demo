const ABSTRACT_METHOD = 'Abstract method called!'

export default class LightComponent {
  constructor() {
    this.mountPoint = null
    this.rootEl = null
  }

  mount(mountPoint) {
    this.mountPoint = mountPoint
    this.mountPoint.appendChild(this.rootEl)
  }

  unMount() {
    this.mountPoint.removeChild(this.rootEl)
    this.mountPoint = null
  }
}
