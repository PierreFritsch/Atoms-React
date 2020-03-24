import React from 'react';

export default class AtomsCell extends React.Component {

  clicked() {
    this.props.onClick(
      this.props.line,
      this.props.column
    );
  }

  render() {
    return (
      <button 
        className={`cell ${this.props.color} ${this.props.color}-${this.props.value}`} 
        onClick={this.clicked.bind(this)}>
      </button>
    );
  }
}