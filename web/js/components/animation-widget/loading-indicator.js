import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal, ModalBody, ModalHeader, Progress,
} from 'reactstrap';
import Spinner from 'react-loader';

export default function LoadingIndicator(props) {
  const {
    onClose, title, bodyMsg, loadedItems, totalItems,
  } = props;

  const msgStyle = {
    minHeight: 30, marginBottom: 50, fontSize: 14, textAlign: 'center',
  };
  const barStyle = { margin: 12 };
  const spinnerStyle = { minHeight: 50 };
  const progressValue = ((loadedItems / totalItems) * 100).toFixed(0);

  const renderProgressBar = () => (
    <div style={barStyle}>
      <Progress
        animated
        striped
        value={progressValue}
      />
    </div>
  );

  const renderSpinner = () => (
    <div style={spinnerStyle}>
      <Spinner color="#fff" loaded={false} />
    </div>
  );

  return (
    <Modal
      isOpen
      toggle={onClose}
      size="md"
      backdrop={false}
      wrapClassName="clickable-behind-modal"
    >
      <ModalHeader toggle={onClose}>{title}</ModalHeader>
      <ModalBody>
        {bodyMsg && (
          <div style={msgStyle}>{bodyMsg}</div>
        )}
        {totalItems ? renderProgressBar() : renderSpinner()}
      </ModalBody>
    </Modal>
  );
}

LoadingIndicator.propTypes = {
  onClose: PropTypes.func,
  title: PropTypes.string,
  bodyMsg: PropTypes.string,
  loadedItems: PropTypes.number,
  totalItems: PropTypes.number,
};
