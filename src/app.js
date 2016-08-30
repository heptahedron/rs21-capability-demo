import React from 'react'
import ReactDOM from 'react-dom'

import AppComponent from './components/app-component/component'

import appConfig from './app-config.json'
import styles from './styles/main.css'

function initApp() {
  const appMountPoint = document.createElement('div'),
        awaitFbData = new Promise((resolve, reject) => {
          require(['fbdata!../data/FacebookPlaces_Albuquerque.csv'],
            data => resolve(data))
        }),
        awaitCensusData = new Promise((resolve, reject) => {
          require(['!!censusdata!../data/BernallioCensusBlocks_Joined.json'],
            data => resolve(data))
        }),
        awaitTweetData = new Promise((resolve, reject) => {
          require(['tweets!../data/Twitter_141103.csv'],
            data => resolve(data))
        }),
        data = { awaitFbData, awaitCensusData, awaitTweetData }

  appMountPoint.className = styles.reactRoot
  document.body.appendChild(appMountPoint)

  ReactDOM.render(<AppComponent
                    config={appConfig}
                    data={data} />, appMountPoint)
}

document.addEventListener('DOMContentLoaded', initApp)
