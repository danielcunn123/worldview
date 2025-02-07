import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import { saveRotation } from '../../map/util';
import HoverTooltip from '../util/hover-tooltip';

const duration = 500;

class Rotation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      intervalId: null,
    };
    this.rotateOnClick = this.rotateOnClick.bind(this);
    this.clearInterval = this.clearInterval.bind(this);
    this.resetRotation = this.resetRotation.bind(this);
  }

  clearInterval() {
    const { intervalId } = this.state;
    clearInterval(intervalId);
  }

  rotate(degrees) {
    const { map, updateRotationState } = this.props;
    const mapView = map.ui.selected.getView();
    const currentDeg = mapView.getRotation() * (180.0 / Math.PI);
    const rotation = mapView.getRotation() - Math.PI / degrees;
    saveRotation(currentDeg, mapView);
    mapView.animate({ rotation, duration });
    updateRotationState(rotation);
  }

  rotateOnClick = (radians) => {
    const newIntervalId = setInterval(() => {
      this.rotate(radians);
    }, duration);
    this.rotate(radians);
    this.setState({ intervalId: newIntervalId });
  };

  resetRotation() {
    const { map } = this.props;
    this.clearInterval();
    map.ui.selected.getView().animate({
      duration: 500,
      rotation: 0,
    });
  }

  render() {
    const {
      rotation, proj, isDistractionFreeModeActive, isMobile,
    } = this.props;
    const currentRotation = Number(rotation * (180 / Math.PI)).toFixed();
    const isPolarProj = proj.id !== 'geographic' && proj.id !== 'webmerc';

    return !isDistractionFreeModeActive && isPolarProj && (
      <div className="wv-rotation-buttons">
        <button
          type="button"
          className="wv-map-rotate-left wv-map-zoom"
          onMouseDown={() => { this.rotateOnClick(10); }}
          onMouseUp={this.clearInterval}
          onMouseOut={this.clearInterval}
          onMouseMove={(e) => { e.stopPropagation(); }}
        >
          <HoverTooltip
            isMobile={isMobile}
            labelText="Rotate counterclockwise"
            placement="left"
            target=".wv-map-rotate-left"
          />
          <FontAwesomeIcon icon="undo" className="cursor-pointer" />
        </button>

        <button
          type="button"
          className="wv-map-reset-rotation wv-map-zoom"
          onMouseDown={this.resetRotation}
          onMouseUp={this.clearInterval}
          onMouseOut={this.clearInterval}
          onMouseMove={(e) => { e.stopPropagation(); }}
        >
          <HoverTooltip
            isMobile={isMobile}
            labelText="Reset rotation"
            placement="left"
            target=".wv-map-reset-rotation"
          />
          {currentRotation}
        </button>

        <button
          type="button"
          className="wv-map-rotate-right wv-map-zoom"
          onMouseDown={() => { this.rotateOnClick(-10); }}
          onMouseUp={this.clearInterval}
          onMouseOut={this.clearInterval}
          onMouseMove={(e) => { e.stopPropagation(); }}
        >
          <HoverTooltip
            isMobile={isMobile}
            labelText="Rotate clockwise"
            placement="left"
            target=".wv-map-rotate-right"
          />
          <FontAwesomeIcon icon="redo" className="cursor-pointer" />
        </button>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const {
    browser, map, proj, ui,
  } = state;
  const isMobile = browser.lessThan.medium;
  return {
    map,
    proj,
    rotation: map.rotation,
    isDistractionFreeModeActive: ui.isDistractionFreeModeActive,
    isMobile,
  };
};

const mapDispatchToProps = (dispatch) => ({
  updateRotationState: debounce((radians) => {
    dispatch({
      type: 'MAP/UPDATE_ROTATION',
      rotation: radians,
    });
  }, 100),
});

Rotation.propTypes = {
  map: PropTypes.object,
  rotation: PropTypes.number,
  isDistractionFreeModeActive: PropTypes.bool,
  isMobile: PropTypes.bool,
  proj: PropTypes.object,
  updateRotationState: PropTypes.func,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Rotation);
