import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TemperatureUnitButtons from './temperature-unit-buttons';
import {
  changeTemperatureUnit,
} from '../../modules/global-unit/actions';

function GlobalSettings(props) {
  const {
    changeTemperatureUnitAction,
    globalTemperatureUnit,
  } = props;

  return (
    <>
      <div className="global-setting-container">
        <TemperatureUnitButtons
          changeTemperatureUnit={changeTemperatureUnitAction}
          globalTemperatureUnit={globalTemperatureUnit}
        />
      </div>
    </>
  );
}

function mapStateToProps(state) {
  const { globalUnit } = state;
  const { globalTemperatureUnit } = globalUnit;
  return {
    globalTemperatureUnit,
  };
}

const mapDispatchToProps = (dispatch) => ({
  changeTemperatureUnitAction: (value) => {
    dispatch(changeTemperatureUnit(value));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(GlobalSettings);

GlobalSettings.propTypes = {
  changeTemperatureUnitAction: PropTypes.func,
  globalTemperatureUnit: PropTypes.string,
};
