import React from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import lodashEach from 'lodash/each';
import lodashRound from 'lodash/round';
import util from '../../util/util';
import { memoizedDateMonthAbbrev } from '../../modules/compare/selectors';

const { events } = util;

let swipeOffset = null;
let line = null;
let bottomLayers = [];
let topLayers = [];
let mapCase;
let listenerObj;
let percentSwipe = null;
const SWIPE_PADDING = 30;
let dragging = false;

export default class Swipe {
  constructor(
    olMap,
    state,
    eventListenerStringObj,
    valueOverride,
  ) {
    listenerObj = eventListenerStringObj;
    this.map = olMap;
    percentSwipe = valueOverride / 100;
    this.create(state);
    window.addEventListener('resize', () => {
      if (document.querySelector('.ab-swipe-line')) {
        this.destroy();
        this.create(state);
      }
    });
  }

  create(state) {
    const { dateA, dateB } = memoizedDateMonthAbbrev(state)();
    this.dateA = dateA;
    this.dateB = dateB;
    line = addLineOverlay(this.map, this.dateA, this.dateB);
    this.update(state);
  }

  getSwipeOffset = () => swipeOffset

  /**
   * Recursively apply listeners to layers
   * @param {Object} layer | Layer or layer Group obj
   * @param {Function} callback | Function that will apply event listeners to layer
   */
  applyEventsToBaseLayers(layer, callback) {
    const layers = layer.get('layers');
    if (layers) {
      lodashEach(layers.getArray(), (layer) => {
        this.applyEventsToBaseLayers(layer, callback);
      });
    } else {
      callback.call(this, layer);
    }
  }

  update(state, groupName) {
    const { dateA, dateB } = memoizedDateMonthAbbrev(state)();
    if (dateA !== this.dateA || dateB !== this.dateB) {
      this.destroy();
      this.create(state);
    } else {
      const mapLayers = this.map.getLayers().getArray();
      if (!groupName) {
        this.applyEventsToBaseLayers(mapLayers[1], applyLayerListeners);
        this.applyEventsToBaseLayers(mapLayers[0], applyReverseLayerListeners);
      } else if (groupName === 'active') {
        this.applyEventsToBaseLayers(mapLayers[0], applyReverseLayerListeners);
      } else {
        this.applyEventsToBaseLayers(mapLayers[1], applyLayerListeners);
      }
    }
  }

  /**
   * Clip the top layer at the right xOffset
   * @param {Object} event | OL Precompose event object
   */
  clip = (event) => {
    const ctx = event.context;
    const viewportWidth = event.frameState.size[0];
    const width = ctx.canvas.width * (swipeOffset / viewportWidth);
    ctx.save();
    ctx.beginPath();
    ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
    ctx.clip();
  }

  /**
   * Clip the reverse so users don't see this layerGroup when the other
   * Layer group is transparent
   * @param {Object} event | OL Precompose event object
   */
  reverseClip = (event) => {
    const ctx = event.context;
    const viewportWidth = event.frameState.size[0];
    const width = ctx.canvas.width * (1 - swipeOffset / viewportWidth);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, ctx.canvas.width - width, ctx.canvas.height);
    ctx.clip();
  }

  destroy() {
    mapCase.removeChild(line);
    this.removeListenersFromLayers(topLayers);
    this.removeListenersFromBottomLayers(bottomLayers);
    topLayers = [];
    bottomLayers = [];
  }

  /**
   * Remove all listeners from layer group
   * @param {Array} layers | Layer group
   */
  removeListenersFromBottomLayers(layers) {
    lodashEach(layers, (layer) => {
      layer.un('prerender', this.reverseClip);
      layer.un('postrender', restore);
    });
  }

  /**
   * Remove all listeners from layer group
   * @param {Array} layers | Layer group
   */
  removeListenersFromLayers(layers) {
    lodashEach(layers, (layer) => {
      layer.un('prerender', this.clip);
      layer.un('postrender', restore);
    });
  }
}

/**
 * Add Swiper
 * @param {Object} map | OL map object
 * @param {String} dateA | YYYY-MM-DD
 * @param {String} dateB | YYYY-MM-DD
 */
const addLineOverlay = function(map, dateA, dateB) {
  const lineCaseEl = document.createElement('div');
  const draggerEl = document.createElement('div');
  const draggerCircleEl = document.createElement('div');
  const firstLabel = document.createElement('span');
  const secondLabel = document.createElement('span');
  const windowWidth = window.innerWidth;
  mapCase = map.getTargetElement();
  draggerCircleEl.className = 'swipe-dragger-circle';
  firstLabel.className = 'ab-swipe-span left-label';
  secondLabel.className = 'ab-swipe-span right-label';
  const isSameDate = dateA === dateB;
  let dateAText = 'A';
  let dateBText = 'B';
  if (!isSameDate) {
    firstLabel.className += ' show-date-label';
    secondLabel.className += ' show-date-label';
    dateAText += `: ${dateA}`;
    dateBText += `: ${dateB}`;
  }
  firstLabel.appendChild(document.createTextNode(dateAText));
  secondLabel.appendChild(document.createTextNode(dateBText));

  draggerEl.className = 'ab-swipe-dragger';
  lineCaseEl.className = 'ab-swipe-line';
  lineCaseEl.appendChild(firstLabel);
  lineCaseEl.appendChild(secondLabel);
  draggerEl.appendChild(draggerCircleEl);
  ReactDOM.render(<FontAwesomeIcon icon="arrows-alt-h" />, draggerCircleEl);
  lineCaseEl.appendChild(draggerEl);
  mapCase.appendChild(lineCaseEl);
  swipeOffset = percentSwipe
    ? windowWidth * percentSwipe
    : swipeOffset || windowWidth / 2;
  lineCaseEl.style.transform = `translateX( ${swipeOffset}px)`;

  // Add event listeners to Elements
  [lineCaseEl, draggerEl].forEach((el) => {
    el.addEventListener(
      'mousedown',
      () => {
        listenerObj = {
          type: 'default',
          start: 'mousedown',
          move: 'mousemove',
          end: 'mouseup',
        };
        dragLine(listenerObj, lineCaseEl, map);
      },
      true,
    );

    el.addEventListener(
      'touchstart',
      () => {
        listenerObj = {
          type: 'touch',
          start: 'touchstart',
          move: 'touchmove',
          end: 'touchend',
        };
        dragLine(listenerObj, lineCaseEl, map);
      },
      true,
    );
  });

  return lineCaseEl;
};

const dragLine = function(listenerObj, lineCaseEl, map) {
  function move(evt) {
    if (!dragging) {
      dragging = true;
      events.trigger('compare:movestart');
    }
    const windowWidth = window.innerWidth;
    if (listenerObj.type === 'default') evt.preventDefault();
    evt.stopPropagation();

    if (listenerObj.type === 'touch') {
      swipeOffset = evt.touches[0].pageX;
    } else {
      swipeOffset = evt.clientX;
    }
    // Prevent swiper from being swiped off screen
    swipeOffset = swipeOffset > windowWidth - SWIPE_PADDING
      ? windowWidth - SWIPE_PADDING
      : swipeOffset < SWIPE_PADDING
        ? SWIPE_PADDING
        : swipeOffset;
    percentSwipe = swipeOffset / windowWidth;
    lineCaseEl.style.transform = `translateX( ${swipeOffset}px)`;

    map.render();
  }
  function end(evt) {
    dragging = false;
    events.trigger(
      'compare:moveend',
      lodashRound((swipeOffset / mapCase.offsetWidth) * 100, 0),
    );

    window.removeEventListener(listenerObj.move, move);
    window.removeEventListener(listenerObj.end, end);
  }
  window.addEventListener(listenerObj.move, move);
  window.addEventListener(listenerObj.end, end);
};
/**
 * Add listeners for layer clipping
 * @param {Object} layer | Ol Layer object
 */
const applyLayerListeners = function(layer) {
  layer.on('prerender', this.clip);
  layer.on('postrender', restore);
  bottomLayers.push(layer);
};
/**
 * Layers need to be inversely clipped so that they can't be seen through
 * the other layergroup in cases where the layergroups layer opacity is < 100%
 * @param {Object} layer | Ol Layer object
 */
const applyReverseLayerListeners = function(layer) {
  layer.on('prerender', this.reverseClip);
  layer.on('postrender', restore);
  topLayers.push(layer);
};

const restore = function(event) {
  const ctx = event.context;
  ctx.restore();
};
