import React from 'react';
import PropTypes from 'prop-types';
import { ListGroup, ListGroupItem } from 'reactstrap';
import Scrollbar from '../../util/scrollbar';
import { coverageDateFormatter } from '../../../modules/date/util';

export default class DateRanges extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showRanges: false,
    };
  }

  renderListItem = (layer) => layer.dateRanges
    .slice(0)
    .reverse()
    .map((l) => {
      let listItemStartDate;
      let listItemEndDate;
      if (l.startDate) {
        listItemStartDate = coverageDateFormatter('START-DATE', l.startDate, layer.period);
      }
      if (l.endDate) {
        listItemEndDate = coverageDateFormatter('END-DATE', l.endDate, layer.period);
      }
      return (
        <ListGroupItem key={`${l.startDate} - ${l.endDate}`}>
          {`${listItemStartDate} - ${listItemEndDate}`}
        </ListGroupItem>
      );
    })

  render() {
    const { layer } = this.props;
    const { showRanges } = this.state;
    const style = showRanges ? { display: 'block' } : { display: 'none' };
    const listItems = this.renderListItem(layer);

    return (
      <>
        <sup
          className="layer-date-ranges-button"
          onClick={() => {
            this.setState({ showRanges: !showRanges });
          }}
        >
          *View Dates
        </sup>
        <div
          style={style}
          id="layer-date-range-list-wrap"
          className="layer-date-wrap"
        >
          <div>
            <p>Date Ranges:</p>
          </div>
          <Scrollbar style={{ maxHeight: 400 }}>
            <ListGroup className="layer-date-ranges" id="layer-settings-date-range-list">
              {listItems}
            </ListGroup>
          </Scrollbar>
        </div>
      </>
    );
  }
}

DateRanges.propTypes = {
  layer: PropTypes.object,
};
