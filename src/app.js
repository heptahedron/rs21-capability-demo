import React from 'react'
import ReactDOM from 'react-dom'

import AppComponent from './components/app-component/component'

import { fbLayers, twitterLayers, censusLayers } from './map-layers'
import appConfig from './app-config.json'
import styles from './styles/main.css'

function initApp() {
  const appMountPoint = document.createElement('div'),
        awaitFbData = new Promise((resolve, reject) => {
          require(['fbdata!../data/FacebookPlaces_Albuquerque.csv'],
            data => resolve({
              data,
              layers: fbLayers
            }))}),
        awaitCensusData = new Promise((resolve, reject) => {
          require(['!!censusdata!../data/BernallioCensusBlocks_Joined.json'],
            data => resolve({
              data,
              layers: censusLayers
            }))}),
        awaitTweetData = new Promise((resolve, reject) => {
          require(['tweets!../data/Twitter_141103.csv'],
            data => resolve({
              data,
              layers: twitterLayers
            }))}),
        sources = { awaitFbData, awaitCensusData, awaitTweetData }

  appMountPoint.className = styles.reactRoot
  document.body.appendChild(appMountPoint)

  ReactDOM.render(<AppComponent
                    config={appConfig}
                    sources={sources} />, appMountPoint)
}

document.addEventListener('DOMContentLoaded', initApp)
